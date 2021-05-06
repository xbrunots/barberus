import { useState, FormEvent } from 'react';
import { Textarea, Select, Flex, Image, Button, Text, useToast, Spinner, List, ListItem, Avatar, AvatarBadge, Divider } from '@chakra-ui/core'
import OverflowWrapper from 'react-overflow-wrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTimes, faColumns } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import $ from 'jquery';
import jsCookie from 'js-cookie';
import { configs } from '../config.json';
import Input from '../../components/Input'
import ListUnidades from '../../components/ListUnidades'
import ListBarbeiros from '../../components/BarbeirosComponent'
import Financeiro from '../../components/FinanceiroComponent'
import Estoques from '../../components/EstoqueComponent'
import Agendamentos from '../../components/AgendamentoComponenet'
import PopUpSQL from '../../components/PopupEditSQL'
import axios from 'axios';
var LocalStore = require('localstorejs');
import { useHistory } from "react-router-dom";
import Parser from 'html-react-parser';
import { stat } from 'fs';
var dayjs = require('dayjs')


export default function Home({ _session }) {
  const [session, setSession] = useState(_session);
  const toast = useToast()
  const router = useRouter()
  const API = configs.api
  const AVATAR = configs.avatar

  function getUser() {
    return JSON.parse(localStorage.getItem('userData'))
  }

  function getClients() {
    return JSON.parse(localStorage.getItem('clientData'))
  }

  function getbarbeiros() {
    return JSON.parse(localStorage.getItem('barberData'))
  }

  function getServices() {
    return JSON.parse(localStorage.getItem('servicesData'))
  }

  function loadData() {
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };

    $('.footer>.value').html("")

    axios.get(API + '/profile', config)
      .then(function (response) {
        console.log(response)
        var quem = response.data.profile[0].name
        if (quem == undefined) [
          quem = response.data.profile[0].email
        ]


        localStorage.setItem('userData', JSON.stringify(response.data.profile[0]))
        localStorage.setItem('clientData', JSON.stringify(response.data.clients))
        localStorage.setItem('barberData', JSON.stringify(response.data.barbers))
        localStorage.setItem('servicesData', JSON.stringify(response.data.services))

        rendererHome()
      })
      .catch(function (error) {
        console.log(error)
        toast({
          title: "Oops!",
          description: "Token Inválido, refaça o login!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })

        router.push('/login')
      });
  }

  function api_changeAvatar(newPhoto, callback) {
    var config = {
      headers: {
        'Content-Type': 'application/json',
        'token': localStorage.getItem('token')
      }
    };
    var bodyJson = {
      set: { photo: "" },
      where: {
        id: getUser().id
      }
    }
    bodyJson.set.photo = newPhoto

    axios.post(API + '/update/users', bodyJson, config)
      .then(function (response) {
        callback(true)
      })
      .catch(function (error) {
        console.log(error)
        toast({
          title: "Oops!",
          description: "Falha ao tentar trocar avatar!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
        callback(false)
      });
  }


  function rendererHome() {
    var user = getUser()

    $("#homeImageLogo").attr('src', "./images/avatar/" + user.photo)
    $("#homeHeaderImageLogo").attr('src', "./images/avatar/" + user.photo)

    var name = user.email
    if (user.name != undefined && user.name != null) {
      name = user.name
    }
    $('.homeSidebarRightHeaderTextName').html(name)
    //0=barber, 1=owner; 2=gerente de barbearia
    var type = "OWNER"
    if (parseInt(user.type) == 0) {
      type = "BARBER"
    } else if (parseInt(user.type) == 1) {
      type = "OWNER"
    } else if (parseInt(user.type) == 2) {
      type = "MANAGER"
    } else {
      type = "BARBER"
    }

    $('.clientes_ul').html("")
    getClients().map((e, i) => {
      var row = `
    <li class="clientes_ul_item"  id="clientes_item` + e.id + `">
    <div class="avatar_default">
    <div class="color_random" style="background: `+ getRandomColor() + `5e; color: white;" aria-label=" ` + e.name + `"> ` + initials(e.name) + `</div>
    </div> `+ e.name + `
    <p>  `+ parsePhone(e.whatsapp) + ` </p>
    </li>
    `
      $(document).on("click", '#clientes_item' + e.id, function () {
        handleClientesUlClickItem(e)
      })

      $('.clientes_ul').append(row)
    })


    $('.homeSidebarRightHeaderTextTypeName').html(type)
    $('.homeSidebarRightHeaderTextEmail').html(user.email)
    $('.__initial_loading').fadeOut()
    $('.form_edit_barber').css('opacity', 1)
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function initials(name) {
    let rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');

    let initials = [...name.matchAll(rgx)] || [];

    initials = (
      (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
    ).toUpperCase();

    return initials
  }

  function handlerClickMenuSidebarLeft(context) {
    $('.sidebar_left_menu_item').removeClass('sidebar_left_menu_item_selected')
    $("#" + context).addClass('sidebar_left_menu_item_selected')
    router.push({
      pathname: '/app/',
      hash: context.replace("menu_", "")
    })
    $('.shadow_components').fadeOut()
    $('.filters_containers>.item').removeClass('selected')
    if (context == "menu_push") {
      handleShowPushForm()
    } else if (context == "menu_unidades") {
      $('.pop_unidades').css('display', 'flex')
      $('.pop_unidades').fadeIn(200)
    } else if (context == "menu_barbeiros") {
      inflateBarbeirosArray(function (success) {
        if (success) {
          $('.pop_barbeiros').css('display', 'flex')
          $('.pop_barbeiros').fadeIn()
        }
      })
    } else if (context == "menu_financeiro") {
      $('.pop_financeiro').css('display', 'flex')
      $('.pop_financeiro').fadeIn()
    } else if (context == "menu_estoques") {
      $('.pop_estoques').css('display', 'flex')
      $('.pop_estoques').fadeIn()
    } else if (context == "menu_agendamentos") {
      $('.pop_agendamentos').css('display', 'flex')
      $('.pop_agendamentos').fadeIn()
    }
  }

  function inflateBarbeirosArray(callback) {
    $('ul[property="prefix_barbeiros"].list_ul').html("")

    getbarbeiros().map((e, i) => {
      var row = `
    <li property="prefix_barbeiros" class="list_ul_item"  id="list_unidades_item` + e.id + `">
    <div class="avatar_default"> 
    <img property="prefix_barbeiros" class="profile_photo" src="./images/avatar/`+ e.photo + `" />
    </div> `+ e.name + `
    <p>  `+ parsePhone(e.whatsapp) + ` </p>
    </li>
    `
      $(document).on("click", '[property="prefix_barbeiros"]>#list_unidades_item' + e.id, function () {
        handleBarbeirosListItemClick(e)
      })

      $('ul[property="prefix_barbeiros"].list_ul').append(row)
    })

    callback(true)
  }

  function validateNullBarbeirosFields(index, value) {
    var str = value
    if (str == null || str == "null" || str == undefined) {
      str = ''
      $('#prefix_barbeiros_form_input' + index).val('')
      $('#prefix_barbeiros_form_input' + index).parent().find("p").removeClass("input_selected")
    }
    if (index == 4 && value.toString().length < 3) {
      $('#prefix_barbeiros_form_input' + index).val('')
    }
    if (index == 13) {
      //0=validar por email, 1=ativo, 2-inativo
      if (parseInt(value) == 0) {
        str = "VALIDAR EMAIL"
      } if (parseInt(value) == 1) {
        str = "ATIVO"
      } if (parseInt(value) == 2) {
        str = "INATIVO"
      }
    }

    if (index == 13) {
      //0=validar por email, 1=ativo, 2-inativo
      if (parseInt(value) == 0) {
        str = "VALIDAR EMAIL"
      } if (parseInt(value) == 1) {
        str = "ATIVO"
      } if (parseInt(value) == 2) {
        str = "INATIVO"
      }
    }

    if (str.toString().length > 0) {
      $('#prefix_barbeiros_form_input' + index).parent().find("p").addClass("input_selected")
    }

    return str
  }

  function handleBarbeirosListItemClick(item) {


    $('#prefix_barbeiros_form_input0').val(validateNullBarbeirosFields(0, item.id))
    $('#prefix_barbeiros_form_input1').val(validateNullBarbeirosFields(1, item.name))
    $('#prefix_barbeiros_form_input2').val(validateNullBarbeirosFields(2, item.email))
    $('#prefix_barbeiros_form_input3').val(validateNullBarbeirosFields(3, parsePhone(item.whatsapp)))
    $('#prefix_barbeiros_form_input4').val(validateNullBarbeirosFields(4, parseDate(item.nasc)))
    $('#prefix_barbeiros_form_input5').val(validateNullBarbeirosFields(5, item.photo))
    $('#prefix_barbeiros_form_input6').val(validateNullBarbeirosFields(6, item.percent))
    $('#prefix_barbeiros_form_input7').val(validateNullBarbeirosFields(7, item.cpf))
    $('#prefix_barbeiros_form_input8').val(validateNullBarbeirosFields(8, item.rg))
    $('#prefix_barbeiros_form_input9').val(validateNullBarbeirosFields(9, item.postal_code))
    $('#prefix_barbeiros_form_input10').val(validateNullBarbeirosFields(10, item.city))
    $('#prefix_barbeiros_form_input11').val(validateNullBarbeirosFields(11, item.state))
    $('#prefix_barbeiros_form_input12').val(validateNullBarbeirosFields(12, item.address))
    $('#prefix_barbeiros_form_input13').val(validateNullBarbeirosFields(13, item.status))
    $('#prefix_barbeiros_form_input14').val(validateNullBarbeirosFields(14, item.comments))

    $('.barber_whatsbutton').attr('data-phone', item.whatsapp)
    $('[property="prefix_barbeiros"].list_main>.sidebar>.header>.sideabar_name').html(item.name)

    if (item.photo != null) {
      $('[property="prefix_barbeiros"].list_main>.sidebar>.header>.sideabar_photo').attr('src', './images/avatar/' + item.photo)
    }

    $('[property="prefix_barbeiros"].list_ul_item').removeClass('list_ul_item_selected')
    $('[property="prefix_barbeiros"]#list_unidades_item' + item.id).addClass('list_ul_item_selected')
    _openMenuBarbeiros()
    $('.no_barbeiros_main').fadeOut()
  }

  function _openMenuBarbeiros() {
    $('[property="prefix_barbeiros"].sidebar').animate({ width: '65%' }, 400)
    $('[property="prefix_barbeiros"].list_filter_container').animate({ width: '35%' }, 400)
    $('[property="prefix_barbeiros"].list_ul').animate({ width: '35%' }, 400)
  }

  function handlerSubmitCreate(event: FormEvent) {
    event.preventDefault();
  }

  function handlePhotoClick(context) {
    $('.__shadow').fadeIn(500)
    $('.home_sidebar_right').animate({
      right: '0px'
    }, 200)
  }

  function handleCloseSidebarRight(context) {
    $('.__shadow').fadeOut(500)
    $('.home_sidebar_right').animate({
      right: '-310px'
    }, 200)
  }

  function handleOpenCaixa(context) {
    $('.caixa_box').animate({
      bottom: '0px'
    }, 200)
    $('.header_home').animate({
      width: '98%',
      top: '24px'
    }, 200, function () {
      $('.header_home').addClass('header_float')
    })
  }

  function handleCloseCaixaBox(context) {
    $('.caixa_box').animate({
      bottom: '-150%'
    }, 200)
    $('.header_home').animate({
      width: '100%',
      borderRadius: '0px 0px 14px 14px',
      top: '0px'
    }, 200, function () {
      $('.header_home').removeClass('header_float')
    })
    handlerClickMenuSidebarLeft('menu_inicio')
  }

  function handleSendWhatsAppMessage() {
    var whatsapp = $('#clientes_sidebar>.box_default_top>.box_default_top_title').attr('whatsapp')
    var url = "https://api.whatsapp.com/send?phone=550" + whatsapp.replace("(", "", "").replace(")", "", "").replace("-", "", "").replace(" ", "", "").trim()
    var win = window.open(url, '_blank');
  }


  function handleOpenSidebarLeft(context) {

    if ($('.pictureOpenSidebarLeft').hasClass('pictureOpenSidebarLeft_active')) {
      $('.pictureOpenSidebarLeft').removeClass('pictureOpenSidebarLeft_active')
      $('.sidebar_left_menu_item>p').fadeOut(150, function () {
        $('.home_sidebar_left').animate({
          width: '120px'
        }, 300)
      })

      $('.inicio_head_box').animate({
        'margin-left': '100px'
      }, 300)

    } else {
      $('.home_sidebar_left').animate({
        width: '300px'
      }, 200, function () {
        $('.sidebar_left_menu_item>p').fadeIn()
      })

      $('.inicio_head_box').animate({
        'margin-left': '300px'
      }, 300)
      $('.pictureOpenSidebarLeft').addClass('pictureOpenSidebarLeft_active')
    }
  }

  function handleOnHoverCardRow(context, isHover) {
    if (isHover) {
      $('.' + context).addClass('hover_card_rows')
    } else {
      $('.' + context).removeClass('hover_card_rows')
    }
  }

  function handleOpenCartSidebar(context) {
    $('.__shadow').fadeIn(500)
    $('#cart_sidebar').animate({
      right: '0px'
    }, 200)

    handlerClickMenuSidebarLeft('menu_caixa')
  }

  function handleAddServiceInCart(context) {

  }
  //agendamento_sidebar

  function handleCloseAgendamento(d) {
    $('.__shadow').fadeOut(500)
    $('#agendamento_sidebar').fadeOut(200)
    $('#agendamento_sidebar').animate({
      top: '101%'
    }, 200)
    handlerClickMenuSidebarLeft('menu_inicio')
  }

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function validateTelefone(t) {
    //    var t = "+99 (99) 99999-9999";

    var RegExp = /\+\d{2}\s\(\d{2}\)\s\d{4,5}-?\d{4}/g;
    return RegExp.test("+55 " + t); //true
  }

  function handleSaveAddCliente() {

    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') },
      validateStatus: function (status) {
        return true;
      }
    };

    var nome = $('#form_cadastro_client_input1').val()
    var email = $('#form_cadastro_client_input2').val()
    var whats = $('#form_cadastro_client_input3').val().replace(" ", "").replace("(", "").replace(")", "").replace("+", "").replace("-", "").trim()
    var niver = $('#form_cadastro_client_input4').val()
    var obs = $('#form_cadastro_client_input5').val()

    if (!validateEmail(email)) {
      toast({
        title: "Oops!",
        description: "E-mail inválido!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      return
    }


    if (whats == undefined || whats == null || whats.length < 11) {
      toast({
        title: "Oops!",
        description: "WhatsApp inválido!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      return
    }

    if (niver == undefined || niver == null || niver.split("/").length < 2) {
      toast({
        title: "Oops!",
        description: "Data de nascimento inválida!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      return
    }


    if (nome == undefined || nome == null) {
      toast({
        title: "Oops!",
        description: "Nome inválido!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      return
    }

    var aniversario = niver.split("/")[2] + niver.split("/")[1] + niver.split("/")[0]

    var jsonData = {
      name: nome,
      email: email,
      whatsapp: whats,
      birth_date: aniversario,
      comments: obs
    }

    axios.post(API + '/clients', jsonData, config)
      .then(function (response) {
        console.log(response)
        if (response.data.error != undefined) {
          toast({
            title: "Oops!",
            description: response.data.error,
            status: "error",
            duration: 4000,
            isClosable: true,
          })
          return
        }
        if (response.data.insertId != undefined) {
          handleCloseAddCliente(1)
          toast({
            title: "Uhul!",
            description: nome + " cadastrado com sucesso!",
            status: "success",
            duration: 4000,
            isClosable: true,
          })
          loadData()
        } else {
          toast({
            title: "Oops!",
            description: "Dados incorretos, verifique o formulário e tente novamente!",
            status: "error",
            duration: 4000,
            isClosable: true,
          })
        }
      })
      .catch(function (error) {
        console.log(JSON.stringify(error))
        toast({
          title: "Oops!",
          description: "Dados incorretos, verifique o formulário e tente novamente!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
      });

  }

  function handleCloseAddCliente(d) {
    $('#clientes_sidebar_shadow').fadeOut(300)
    $('.add_clientes_sidebar').animate({
      right: '-41%'
    }, 200)
  }

  function handleAddNewClient(context) {
    $('#clientes_sidebar_shadow').fadeIn(200)
    $('.add_clientes_sidebar').animate({
      right: '0px'
    }, 200)
  }


  function handleAgendamentoTagSelect(context) {
    closeAgendamentoSidebarOptions()

    $('button').removeClass('tag_selected')
    $('.tag_' + context).addClass('tag_selected')
    $('.agendamento_combo_barbeiros').fadeOut(100)
    $('.agendamento_combo_barbeiros_input_filter').fadeOut(50)
    $('.agendamento_combo_barbeiros_input_filter_unidades').fadeOut(50)
    $('.agendamento_combo_barbeiros_input_filter_clientes').fadeOut(50)
    handleBarbeiroFilterClear()

    if (context == 'barbeiro') {
      $('.agendamento_sidebar_options_title').html("Selecione um barbeiro para refinar a lista")
      $('.agendamento_combo_barbeiros.barbeiros').fadeIn(200)
      $('.agendamento_combo_barbeiros_input_filter').fadeIn(100)
      openAgendamentoSidebarOptions()
    } else if (context == 'unidade') {
      $('.agendamento_sidebar_options_title').html("Selecione uma unidade para refinar a lista")
      $('.agendamento_combo_barbeiros.unidades').fadeIn(200)
      $('.agendamento_combo_barbeiros_input_filter_unidades').fadeIn(100)

      openAgendamentoSidebarOptions()
    } else if (context == 'cliente') {
      $('.agendamento_sidebar_options_title').html("Selecione um cliente para refinar a lista")
      $('.agendamento_combo_barbeiros.clientes').fadeIn(200)
      $('.agendamento_combo_barbeiros_input_filter_clientes').fadeIn(100)
      openAgendamentoSidebarOptions()

    }
  }

  function openAgendamentoSidebarOptions() {
    $('.agendamento_sidebar_options').animate({
      opacity: 1,
      top: '25%'
    }, 100)
  }


  function closeAgendamentoSidebarOptions() {
    $('.agendamento_sidebar_options').animate({
      opacity: 0,
      top: '101%'
    }, 200)
  }

  function handleShowPushForm() {
    $('.push_form').animate({
      bottom: '0px'
    }, 200)
    $('.__shadow').fadeIn(500)
  }

  function handleClosePushForm() {
    $('.__shadow').fadeOut(500)
    $('.push_form').animate({
      bottom: '-500px'
    }, 200)
    handlerClickMenuSidebarLeft('menu_inicio')
  }

  function sendPushMessageClick() {
    handleClosePushForm()
    toast({
      title: "Mensagem enviada com sucesso!",
      description: "Os pushs serão enviados gradativamente no decorrer do dia",
      status: "success",
      duration: 9000,
      isClosable: true,
    })
  }

  function handleAddServiceInCartClickItem(item) {
    $('.cart_services_item').removeClass('cart_item_selected')
    $('#cart_list_item' + item.id).addClass('cart_item_selected')
    $('.box_default_footer').animate({
      right: '0px'
    }, 200)
    $('.box_default_footer_top_title').html("<B>Comanda de</B> " + item.name)
  }

  function handleClientesUlClickItem(item) {
    openClient(item, function (success, response) {
      if (success && response.data.calendar.data.length > 0) {
        $('.clientes_ul_item').removeClass('clientes_item_selected')
        $('#clientes_item' + item.id).addClass('clientes_item_selected')
        $('.no_client_main').fadeOut(50)
        $('.clientes_detalhe_body').css('opacity', 1)
        $('#clientes_sidebar>.box_default_top>.box_default_top_title').text(item.name)
        $('#clientes_sidebar>.box_default_top>.box_default_top_title').attr('whatsapp', item.whatsapp)

        var calendar = response.data.calendar.data
        var photos = response.data.instabarber.data
        $('.clientes_instabarber_ul').html("")

        photos.forEach(element => {
          var row = `
          <li class="clientes_instabarber_li " 
          id="clientes_instabarber_item`+ element.id + `"><div class="avatar_default">
          <img src="`+ element.photo + `" "></div>
          <div class="social "><p class="item1 item ">   
          <img alt="Barberus" class="likes" src="/images/like.webp"> `+ element.likes + ` </p>  
           </div>
           </li>`
          $('.clientes_instabarber_ul').append(row)
        });
        $('.clientes_agendamento_ul').html("")

        var head = '<li class="clientes_agendamento_li clientes_agendamento_head css-992tcj"><div class="row css-k008qs"><p class="item1 item head css-1gxwm28">     Data </p><p class="item2 item head css-1gxwm28">   Descrição </p><p class="item3 item head css-1gxwm28">    Valor </p><p class="item4 item head css-1gxwm28">    Status </p><p class="item5 item head css-1gxwm28">     Tempo </p></div></li>'
        $('.clientes_agendamento_ul').append(head)
        calendar.forEach(element => {
          var row = `
          <li class="clientes_agendamento_li" data-status="`+ parseStatus(element.status).toLowerCase() + `" data-name="row" id="clientes_agendamento_item` + element.id + `">
          <div class="row">
          <p class="item1 item">   `+ parseDate(element.date) + ` ` + parseHour(element.hour) + `  </p>
          <p class="item2 item">    `+ element.name + ` </p>
          <p class="item3 item">    `+ parseMoney(element.price) + ` </p>
          <p class="item4 item" data-name=" `+ parseStatus(element.status) + `">      ` + parseStatus(element.status) + ` </p>
          <p class="item5 item">      `+ element.time + ` min </p></div></li>
          `
          $('.clientes_agendamento_ul ').append(row)
        });
      } else {
        toast({
          title: "OOps!",
          description: "Não existem agendamentos para mostrar :(",
          status: "info",
          duration: 9000,
          isClosable: true,
        })
      }
    })
  }

  function parseStatus(str) {
    var status = "Agendado"
    if (str == 1) {
      status = "Agendado"
    }

    if (str == 0) {
      status = "Cancelado"
    }

    if (str == 2) {
      status = "Concluído"
    }
    return status
  }

  function openClient(item, callback) {
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };

    axios.get(API + '/clients/' + item.id, config)
      .then(function (response) {
        callback(true, response)
      })
      .catch(function (error) {
        callback(false, null)
        console.log(error)
        toast({
          title: "Oops!",
          description: "Falha na requisição, tente novamente!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
      });
  }


  function handleBarbeiroUlClickItem(item, type) {
    $('.agendamento_combo_item').removeClass('clientes_item_selected')
    $('#agendamento_combo_item' + item.id).addClass('clientes_item_selected')
    // $('.box_default_footer').animate({
    //    right: '0px'
    //  }, 200)
    //$('.box_default_footer_top_title').html("<B>Comanda de</B> " + item.name)
    handleBarbeiroFilterClose()
  }



  function closeClistesUICLickItem() {
    $('.clientes_ul_item').removeClass('clientes_item_selected')
    $('.no_client_main').fadeIn(50)
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').text("clientes")
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').attr('whatsapp', "")
    $('#clientes_sidebar').fadeOut(200)
  }

  function handleAddServiceInCartCancelCLickItem() {
    $('.cart_services_item').removeClass('cart_item_selected')
    $('.box_default_footer').animate({
      right: '-510px'
    }, 200)
    $('.box_default_footer_top_title').text("")
  }

  function handleServiceFilterCartClear() {
    $('.cart_services_input_filter').val("")
    $('.cart_services_item').removeClass('cartItemFilterHide')
  }

  function handleClientesFilterClear() {
    $('.clientes_input_filter').val("")
    $('.clientes_ul_item').removeClass('cartItemFilterHide')
  }

  function handleAgendamentosFilterClear() {
    $('.agendamento_input_filter').val("")
    $('.clientes_agendamento_li[data-name="row"]').removeClass('cartItemFilterHide')
  }

  function handleServiceFilterCart(text) {
    var texto = ($('.cart_services_input_filter').val()).toLowerCase()
    var tempArray = clientsMockServices

    $('.cart_services_item').removeClass('cartItemFilterHide')

    tempArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto) || x.status.toLowerCase().includes(texto) || x.whatsapp.toLowerCase().includes(texto) || x.time.toLowerCase().includes(texto)) {

      } else {
        $('#cart_list_item' + x.id).addClass('cartItemFilterHide')
      }
    })
  }


  function handlerFilterBarbeiros(text) {
    var texto = ($('.agendamento_combo_barbeiros_input_filter').val()).toLowerCase()

    $('.agendamento_combo_item').removeClass('cartItemFilterHide')

    barbeirosArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto)) {

      } else {
        $('#agendamento_combo_item' + x.id).addClass('cartItemFilterHide')
      }
    })

  }

  function handlerFilterBarbeirosUnidades(text) {
    var texto = ($('.agendamento_combo_barbeiros_input_filter_unidades').val()).toLowerCase()
    $('.agendamento_combo_item').removeClass('cartItemFilterHide')

    unidadesArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto)) {

      } else {
        $('#agendamento_combo_item_u' + x.id).addClass('cartItemFilterHide')
      }
    })
  }

  function handlerFilterBarbeirosClientes(text) {
    var texto = ($('.agendamento_combo_barbeiros_input_filter_clientes').val()).toLowerCase()
    $('.agendamento_combo_item').removeClass('cartItemFilterHide')

    clientsMockServices.forEach(x => {
      if (x.name.toLowerCase().includes(texto)) {

      } else {
        $('#agendamento_combo_item_c' + x.id).addClass('cartItemFilterHide')
      }
    })

  }


  function handleBarbeiroFilterClear() {
    $('.agendamento_combo_barbeiros_input_filter').val("")
    $('.agendamento_combo_barbeiros_input_filter_unidades').val("")
    $('.agendamento_combo_barbeiros_input_filter_clientes').val("")
    $('.agendamento_combo_item[data-name="row"]').removeClass('cartItemFilterHide')
  }

  function handleBarbeiroFilterClose() {
    closeAgendamentoSidebarOptions()
  }

  function handleClienteFilter(text) {
    var texto = ($('.clientes_input_filter').val()).toLowerCase()
    var tempArray = clientsMockServices

    $('.cart_services_item ').removeClass('cartItemFilterHide')

    tempArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto) || x.status.toLowerCase().includes(texto) || x.whatsapp.toLowerCase().includes(texto) || x.time.toLowerCase().includes(texto)) {

      } else {
        $('#clientes_item' + x.id).addClass('cartItemFilterHide')
      }
    })
  }

  function handleAgendamentoFilter(text) {
    var texto = ($('.agendamento_input_filter').val()).toLowerCase()
    var tempArray = clienteDetalhes[0].agendamentos

    $('.clientes_agendamento_li[data-name="row"]').addClass('cartItemFilterHide')

    tempArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto) ||
        x.status.toLowerCase().includes(texto) ||
        parseDate(x.date).includes(texto) ||
        parseHour(x.hour).includes(texto)) {
        $('#clientes_agendamento_item' + x.id).removeClass('cartItemFilterHide')
      } else {
        $('#clientes_agendamento_item' + x.id).addClass('cartItemFilterHide')
      }
    })
  }

  function handleCloseCartSidebar(context) {
    $('.__shadow').fadeOut(500)
    $('#cart_sidebar').animate({
      right: '-550px'
    }, 200)
    handlerClickMenuSidebarLeft('menu_inicio')
  }

  function handleCloseClientesSidebar(d) {
    $('.__shadow').fadeOut(500)
    $('#clientes_sidebar').fadeOut(200)
    $('#clientes_sidebar').animate({
      top: '120%'
    }, 200)
    handlerClickMenuSidebarLeft("menu_inicio")
    closeClistesUICLickItem()
  }

  function handleClientesOpen() {
    $('.__shadow').fadeIn(500)
    $('#clientes_sidebar').fadeIn(200)
    $('#clientes_sidebar').animate({
      top: '3%'
    }, 200)
    handlerClickMenuSidebarLeft("menu_clientes")
  }


  //

  var lastPhone = ""
  function handleOnFocusInputContainer(id, type) {
    $('p').removeClass('input_selected_color')
    if ($("#" + id).val().trim().length > 0) {
      $("#" + id).parent().find('p').addClass('input_selected')
      $("#" + id).parent().find('p').addClass('input_selected_color')
    } else {
      $("#" + id).parent().find('p').removeClass('input_selected')
      $("#" + id).parent().find('p').removeClass('input_selected_color')
    }

    if (type.toLowerCase() == "date") {
      $("#" + id).val(date_formator($("#" + id).val()))
    } else if (type.toLowerCase() == "phone") {
      if ($("#" + id).val().length < 14) {
        lastPhone = phone_formatador($("#" + id).val())
        $("#" + id).val(lastPhone)
      } else {
        $("#" + id).val(lastPhone)
      }
    }
  }

  function phone_formatador(str) {
    return str.replace(/^(\d{2})(\d{5})(\d{4})+$/, "($1)$2-$3");
  }


  function handleOnFocusOutInputContainer(id) {
    if ($("#" + id).val() != undefined && $("#" + id).val().trim().length == 0) {
      $("#" + id).parent().find('p').removeClass('input_selected')
    } else {
      $("#" + id).parent().find('p').removeClass('input_selected_color')
    }
  }


  var avatar = AVATAR

  var productsMockItems = [
    { id: 1, name: 'Corte Simples', description: 'Corte com Tesoura e Maquina', price: 'R$ 30,00', time: 30, barberShop: 'Campolim Matriz', type: 'S', photo: './images/corte_sample.jpg' },
    { id: 2, name: 'Barba Simples', description: 'Corte com Tesoura e Maquina', price: 'R$ 28,00', time: 30, barberShop: 'Campolim Matriz', type: 'S', photo: './images/barba.jpg' },
    { id: 3, name: 'Sombrancelha', description: 'Corte com Tesoura e Maquina', price: 'R$ 15,00', time: 30, barberShop: 'Campolim Matriz', type: 'S', photo: './images/corte_sample.jpg' },
    { id: 4, name: 'Chopp Albani', description: 'Corte com Tesoura e Maquina', price: 'R$ 11,00', time: 30, barberShop: 'Campolim Matriz', type: 'P', photo: './images/chop.jpg' },
    { id: 5, name: 'Amendoin Importado', description: 'Corte com Tesoura e Maquina', price: 'R$ 4,90', time: 30, barberShop: 'Campolim Matriz', type: 'P', photo: './images/amendoim.jpg' },
    { id: 6, name: 'Pasta de Pentear HairStyle', description: 'Corte com Tesoura e Maquina', price: 'R$ 55,00', time: 30, barberShop: 'Campolim Matriz', type: 'P', photo: './images/pasta.jpg' },
    { id: 7, name: 'Sonho de Valsa', description: 'Corte com Tesoura e Maquina', price: 'R$ 3,00', time: 30, barberShop: 'Campolim Matriz', type: 'P', photo: './images/sonho_valsa.jpg' },
  ]

  var clientsMockServices = [
    { id: 1, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '09:00', status: 'Cortando' },
    { id: 2, name: 'Alicio A. Junior', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '10:00', status: 'Atrasado' },
    { id: 3, name: 'Bruno Brito Fonseca', whatsapp: '15997572550', isBirthdate: true, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '11:00', status: 'Cancelado' },
    { id: 4, name: 'Alberto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '12:00', status: 'Finalizado' },
    { id: 5, name: 'Jair Bolsonaro', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '14:00', status: 'Finalizado' },
    { id: 6, name: 'Luis Inacio Lula da Silva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '15:00', status: 'Finalizado' },
    { id: 7, name: 'Anacleto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '16:00', status: 'Finalizado' },
    { id: 8, name: 'Zion Brito', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '17:00', status: 'Finalizado' },
  ]

  var agendamento_list = [
    { id: 1, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201201, hour: 9.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 2, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201202, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 3, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201202, hour: 11.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 4, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 12.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 5, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 13.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 6, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 7, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201206, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 8, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201206, hour: 14.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 9, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 13.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 10, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 11, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 15.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 12, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 16.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 13, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 14, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 17.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 15, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 18.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 16, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 19.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 1, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201201, hour: 9.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 2, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201202, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 3, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201202, hour: 11.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 4, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 12.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 5, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 13.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 6, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201204, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 7, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201206, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 8, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201206, hour: 14.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 9, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 13.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 10, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 11, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 15.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 12, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201207, hour: 16.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 13, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 10.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 14, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 17.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 15, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 18.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
    { id: 16, clientName: 'Beto Paiva', name: 'Corte+Barba', date: 20201208, hour: 19.30, price: 25.90, status: 'Aberto', time: 30, barbeiro: "Beto P. G. I", unidade: "Centro" },
  ]

  var clienteDetalhes = [
    {
      id: 1, name: 'Beto Paiva', whatsapp: '15997572550', aniversario: '12/12/1988', photo: './images/default.png', instabarber: [
        { id: 1, clientId: 1, photo: './images/corte2.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 2, clientId: 1, photo: './images/corte3.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 3, clientId: 1, photo: './images/corte4.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 4, clientId: 1, photo: './images/corte5.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 5, clientId: 1, photo: './images/corte6.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 6, clientId: 1, photo: './images/corte7.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 3, clientId: 1, photo: './images/corte4.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 4, clientId: 1, photo: './images/corte5.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 5, clientId: 1, photo: './images/corte6.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 6, clientId: 1, photo: './images/corte7.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 3, clientId: 1, photo: './images/corte4.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 4, clientId: 1, photo: './images/corte5.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 5, clientId: 1, photo: './images/corte6.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 6, clientId: 1, photo: './images/corte7.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 3, clientId: 1, photo: './images/corte4.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 4, clientId: 1, photo: './images/corte5.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 5, clientId: 1, photo: './images/corte6.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 6, clientId: 1, photo: './images/corte7.jpg', likes: 12, shares: 3, comments: 2 },
        { id: 1, clientId: 1, photo: './images/corte8.jpg', likes: 12, shares: 3, comments: 2 }
      ], agendamentos: [
        { id: 1, date: 20201201, hour: 10.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 2, date: 20201223, hour: 12.30, name: 'Corte+Barba', price: 25.90, status: 'cancelado', time: 30 },
        { id: 3, date: 20201111, hour: 10.00, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 4, date: 20200901, hour: 10.30, name: 'Corte', price: 12.90, status: 'cortando', time: 30 },
        { id: 5, date: 20200805, hour: 9.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 6, date: 20200701, hour: 10.30, name: 'Corte+Barba+relaxamento', price: 35.90, status: 'finalizado', time: 30 },
        { id: 3, date: 20201111, hour: 10.00, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 4, date: 20200901, hour: 10.30, name: 'Corte', price: 12.90, status: 'cortando', time: 30 },
        { id: 5, date: 20200805, hour: 9.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 6, date: 20200701, hour: 10.30, name: 'Corte+Barba+relaxamento', price: 35.90, status: 'finalizado', time: 30 },
        { id: 3, date: 20201111, hour: 10.00, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 4, date: 20200901, hour: 10.30, name: 'Corte', price: 12.90, status: 'cortando', time: 30 },
        { id: 5, date: 20200805, hour: 9.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 6, date: 20200701, hour: 10.30, name: 'Corte+Barba+relaxamento', price: 35.90, status: 'finalizado', time: 30 },
        { id: 3, date: 20201111, hour: 10.00, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 4, date: 20200901, hour: 10.30, name: 'Corte', price: 12.90, status: 'cortando', time: 30 },
        { id: 5, date: 20200805, hour: 9.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 },
        { id: 6, date: 20200701, hour: 10.30, name: 'Corte+Barba+relaxamento', price: 35.90, status: 'finalizado', time: 30 },
        { id: 7, date: 20200601, hour: 10.00, name: 'Corte+Barba', price: 25.90, status: 'finalizado', time: 30 }
      ], comments: [
        { id: 1, date: 20201201, hour: 10.30, message: 'Robou uma revista' },
        { id: 2, date: 20201223, hour: 12.30, name: 'Pagou pela revista roubada, alegou ter esquecido de pagar da ultima vez que veio' },
      ]
    },
  ]

  var barbeirosArray = [
    { id: 1, name: 'Beto Paiva', photo: './images/default.png' },
    { id: 2, name: 'Marcos Paiva', photo: './images/default.png' },
    { id: 3, name: 'Beto Paiva', photo: './images/default.png' },
    { id: 4, name: 'Flavio Silva', photo: './images/default.png' },
    { id: 5, name: 'Erik Moura', photo: './images/default.png' },
    { id: 6, name: 'Bruno Brito', photo: './images/default.png' },
    { id: 7, name: 'Geto Paiva', photo: './images/default.png' },
    { id: 8, name: 'Beto Gaiva', photo: './images/default.png' },
    { id: 9, name: 'Beto Paiva', photo: './images/default.png' },
    { id: 10, name: 'Marcos Paiva', photo: './images/default.png' },
    { id: 13, name: 'Beto Paiva', photo: './images/default.png' },
    { id: 14, name: 'Flavio Silva', photo: './images/default.png' },
    { id: 15, name: 'Erik Moura', photo: './images/default.png' },
    { id: 16, name: 'Bruno Brito', photo: './images/default.png' },
    { id: 17, name: 'Geto Paiva', photo: './images/default.png' },
    { id: 18, name: 'Beto Gaiva', photo: './images/default.png' },
  ]

  var unidadesArray = [
    { id: 1, name: 'Centro Sorocaba', photo: './images/default.png' },
    { id: 2, name: 'Franco da Rocha | RE Paiva', photo: './images/default.png' },
    { id: 3, name: 'Paulista 1', photo: './images/default.png' },
    { id: 4, name: 'Paulista 2', photo: './images/default.png' },
    { id: 5, name: 'Iguatemi Alphaville', photo: './images/default.png' },
  ]

  var form_cadastro_client = [
    { id: 1, className: 'name', placeholder: 'Nome', type: 'text' },
    { id: 2, className: 'email', placeholder: 'E-mail', type: 'email' },
    { id: 3, className: 'whatsApp', placeholder: 'WhatsApp', type: 'phone' },
    { id: 4, className: 'nasc', placeholder: 'Data nascimento', type: 'date' },
    { id: 5, className: 'comments', placeholder: 'Observações', type: 'text' }
  ]

  function handleChangeIcon(icon) {
    $('.select_icon_for_user').fadeOut(200)
    api_changeAvatar(icon, function (success) {
      $("#homeImageLogo").attr('src', "./images/avatar/" + icon)
      $("#homeHeaderImageLogo").attr('src', "./images/avatar/" + icon)
    })
  }

  function handleOpenChangePhoto() {
    $('.select_icon_for_user').fadeIn(200)
  }


  function date_formator(date) {

    date = date.replace('//', '/');
    var result = date.split("/");

    var length = result.length;

    // Append "/" after the last two charas, if more than 2 charas then remove it
    if (length <= 2 && result[length - 1] != "") {
      var last_two_digits = result[length - 1];
      if (last_two_digits.length >= 2) {
        date = date.slice(0, -last_two_digits.length);
        date = date + last_two_digits.slice(0, 2) + "/";
      }
    }

    if (typeof result[2] != "undefined") {
      var year = result[2];
      if (year.length > 4) {
        date = date.slice(0, -year.length);
        year = year.slice(0, 4);
        date = date + year;
      }
    }
    return date;
  }

  function isDate(value) {
    var dateFormat;
    if (toString.call(value) === '[object Date]') {
      return true;
    }
    if (typeof value.replace === 'function') {
      value.replace(/^\s+|\s+$/gm, '');
    }
    dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;
    return dateFormat.test(value);
  }

  function isEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function price_to_number(v) {
    if (!v) { return 0; }
    v = v.split('.').join('');
    v = v.split(',').join('.');
    return Number(v.replace(/[^0-9.]/g, ""));
  }

  function number_to_price(v) {
    if (v == 0) { return '0,00'; }
    v = parseFloat(v);
    v = v.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    v = v.split('.').join('*').split(',').join('.').split('*').join(',');
    return v;
  }

  function parseDate(d) { //YYYY MM DD
    var day = d.toString()
    return day[6] + day[7] + "/" + day[4] + day[5] + "/" + day[0] + day[1] + day[2] + day[3]
  }

  function parseMoney(d) { //YYYY MM DD 
    return "R$ " + number_to_price(d)
  }

  function parseHour(hr) { //10.20
    var hour = hr.toString()
    if (hour.length == 2) {
      hour = hour + "00"
    } else if (hour.length < 5) {
      hour = hour + "0"
    }
    return hour.toString().replace(".", ":")
  }



  function parsePhone(phone) {
    return mphone(phone)
  }
  function mphone(v) {
    var r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    if (r.length > 10) {
      // 11+ digits. Format as 5+4.
      r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    }
    else if (r.length > 5) {
      // 6..10 digits. Format as 4+4
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    }
    else if (r.length > 2) {
      // 3..5 digits. Add (0XX..)
      r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    }
    else {
      // 0..2 digits. Just add (0XX
      r = r.replace(/^(\d*)/, "($1");
    }
    return r;
  }

  return (
    <Flex
      as="main"
      width="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Flex className="__initial_loading">
        <Spinner size="xl" />
        <Text>Abrindo barbearia...</Text>
      </Flex>

      {Parser('<div class="__shadow"></div>')}


      <Button onLoad={() => loadData()} className="fab_carrinho" onClick={() => handleOpenCartSidebar(this)}>
        <Image src="/images/caixa_2.png" className="pictureLogo pictureLogoHome fab_carrinho_logo" alt="Barberus" />
      </Button>

      <Flex className="header_home">
        <FontAwesomeIcon
          onClick={() => handleOpenSidebarLeft(this)} className="pictureOpenSidebarLeft pictureOpenSidebarLeft_active" icon={faColumns} />

        <Image marginBottom={8} src="/images/logo.png" className="pictureLogo pictureLogoHome" alt="Barberus" />
        <Text height="60px" marginBottom={8} className="pictureBgLogo pictureBgLogoHome" />

        <Spinner className="loader" />

        <Image id="homeImageLogo"
          borderRadius="50%"
          height="40px"
          //src={_session.photo}
          // alt={_session.email}
          onClick={() => handlePhotoClick(this)}
        />
      </Flex>
      <Flex height="100%" className="home_sidebar_right">
        <Flex className="home_sidebar_right_header"
          height="170px" width="100%"
          justifyContent="center"
          alignItems="center">
          <Text textAlign="center" className="home_sidebar_right_header_thumb"  >

          </Text>

          <Image className="back_button back_button_header"
            borderRadius="50%"
            height="40px"
            src="./images/close.webp"
            alt="fechar"
            onClick={() => handleCloseSidebarRight(this)}
          />
          <Flex className="container_user_edit_photo">
            <Image className="icon_pen"
              borderRadius="50%"
              height="40px"
              src="./images/add.webp"
              alt="fechar"
              onClick={() => handleOpenChangePhoto()}
            /><Image id="homeHeaderImageLogo"
              borderRadius="50%"
              height="40px"
              //src={_session.photo}
              //  alt={_session.email}
              onClick={() => handleOpenChangePhoto()}
            />

          </Flex>


          <List className="select_icon_for_user" spacing={3}>
            {
              avatar.map((e, i) =>
                <ListItem onClick={() => handleChangeIcon(e)}>
                  <Image onClick={() => handleChangeIcon(e)} className="icon_pen"
                    borderRadius="50%"
                    height="40px"
                    src={"./images/avatar/" + e}
                    alt="photo"
                  />
                </ListItem>)
            }
          </List>


        </Flex>
        <Flex className="home_sidebar_right_header_body"
          width="100%" >
          <Button className="home_sidebar_right_header_button_edit" variant="outline">
            Editar perfil
          </Button>
          <Flex className="home_sidebar_right_header_body_contents"
            width="100%" >
            <Flex className="container_name">
              <Text textAlign="center" className="homeSidebarRightHeaderTextName" fontSize="14px" onClick={() => handlePhotoClick(this)} >

              </Text>
              <Text textAlign="center" className="homeSidebarRightHeaderTextTypeName" fontSize="12px" onClick={() => handlePhotoClick(this)} >

              </Text></Flex>
          </Flex>

          <Flex className="container_body">
            <Text textAlign="center" className="homeSidebarRightHeaderTextEmail" fontSize="14px" onClick={() => handlePhotoClick(this)} >

            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        as="body"
        height="1200px"
        width="100%"
        overflow="hidden"
        justifyContent="center"
        alignItems="center"
      >
        <Flex height="100%" width="300px" className="home_sidebar_left">
          <Button id="menu_inicio" onClick={(e) => handlerClickMenuSidebarLeft("menu_inicio")}
            className="sidebar_left_menu_item sidebar_left_menu_item_selected" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_home.webp"
              alt="Início"
            /> <Text> Início</Text>
          </Button>
          <Button id="menu_agendamento" onClick={(e) => handlerClickMenuSidebarLeft('menu_agendamentos')} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_agendamentos.webp"
              alt="Início"
            /><Text>  Agendamentos</Text>
          </Button>
          <Button id="menu_caixa" onClick={(e) => handleOpenCartSidebar("menu_caixa")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/caixa_2.png"
              alt="Início"
            />  <Text>Comandas</Text>
          </Button>
          <Button id="menu_push" onClick={(e) => handlerClickMenuSidebarLeft("menu_push")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_push.webp"
              alt="Início"
            /> <Text>Push Center</Text>
          </Button>
          <Button id="menu_clientes" onClick={(e) => handleClientesOpen()} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_clients.webp"
              alt="Início"
            />  <Text>Clientes</Text>
          </Button>
          { /*<Button id="menu_unidades" onClick={(e) => handlerClickMenuSidebarLeft("menu_unidades")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_unidades.webp"
              alt="Início"
            />   <Text>Unidades</Text>
  </Button> */}
          <Button id="menu_barbeiros" onClick={(e) => handlerClickMenuSidebarLeft("menu_barbeiros")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_barbeiros.webp"
              alt="Início"
            />  <Text>Barbeiros</Text>
          </Button>
          <Button id="menu_financeiro" onClick={(e) => handlerClickMenuSidebarLeft("menu_financeiro")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_financeiro.webp"
              alt="Início"
            /> <Text>Financeiro</Text>
          </Button>
          <Button id="menu_estoques" onClick={(e) => handlerClickMenuSidebarLeft("menu_estoques")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_estoques.webp"
              alt="Início"
            /> <Text> Estoques</Text>
          </Button>

        </Flex>

        <Flex className="histories_box"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Text className="stories_title">Stories</Text>
          <Flex className="bubbles">
            <Flex>   <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>   <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>   <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex> <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>  <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex> <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>  <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>  <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
            <Flex>  <Image className="gradient_instagram" borderRadius="50%" src="./images/corte_sample.jpg" /> <Text className="bubble_name">@Eliezer Bacio</Text>  </Flex>
          </Flex>


        </Flex>

        <Flex className="inicio_head_box">
          {/* <Text className="resumo_title">Resumo</Text> */}

          <Flex className="resumo_row1 resumo_row"
            width="100%"
            justifyContent="center"
            alignItems="center">

            <Flex className="receita_hoje row1"
              justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('receita_hoje', true)}
              onMouseLeave={() => handleOnHoverCardRow('receita_hoje', false)}
              alignItems="center">

              <Image src="/images/hoje.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Receita hoje</Text>
              <Text className="value">R$3.450,45</Text>
            </Flex>

            <Flex className="receita_7dias row1" justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('receita_7dias', true)}
              onMouseLeave={() => handleOnHoverCardRow('receita_7dias', false)}
              alignItems="center">
              <Image src="/images/semana.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Receita semana</Text>
              <Text className="value">R$13.450,45</Text>
            </Flex>

            <Flex className="receita_mes row1" justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('receita_mes', true)}
              onMouseLeave={() => handleOnHoverCardRow('receita_mes', false)}
              alignItems="center">
              <Image src="/images/row_date.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Receita mês</Text>
              <Text className="value">R$63.450,45</Text>
            </Flex>

          </Flex>
          <Flex className="resumo_row2 resumo_row"
            width="100%"
            justifyContent="center"
            alignItems="center">

            <Flex className="agendamentos_hoje row2" justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('agendamentos_hoje', true)}
              onMouseLeave={() => handleOnHoverCardRow('agendamentos_hoje', false)}
              alignItems="center">
              <Image src="/images/agendamento.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Agendamentos hoje</Text>
              <Text className="value">9</Text>
            </Flex>

            <Flex className="cancelamentos_hoje row2" justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('cancelamentos_hoje', true)}
              onMouseLeave={() => handleOnHoverCardRow('cancelamentos_hoje', false)}
              alignItems="center">
              <Image src="/images/aniversario.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Cancelamentos hoje</Text>
              <Text className="value">2</Text>
            </Flex>

            <Flex className="clientes_reviews row2" justifyContent="center"
              onMouseEnter={() => handleOnHoverCardRow('clientes_reviews', true)}
              onMouseLeave={() => handleOnHoverCardRow('clientes_reviews', false)}
              alignItems="center">
              <Image src="/images/review.webp" className="pictureLogo pictureLogoHome" alt="Barberus" />
              <Text className="title">Índice de satisfação</Text>
              <Text className="value">4.5 de 5.0</Text>
            </Flex>


          </Flex>

        </Flex>


        <Flex className="caixa_box" width="100%">
          <Flex className="caixa_box_top" width="100%">
            <Image src="/images/close.webp" onClick={() => handleCloseCaixaBox(this)} className="pictureLogo pictureLogoHome" alt="Barberus" />
            <Text className="caixa_title">
              <Image src="/images/caixa_2.png" className="pictureLogo pictureLogoHome caixa_title_logo" alt="Barberus" />  CAIXA
            </Text>
          </Flex>
          <Flex className="caixa_box_right" width="100%">
          </Flex>
          <Flex className="caixa_box_center" width="100%">
          </Flex>
          <Flex className="caixa_box_left" width="100%">
          </Flex>
        </Flex>

        <Text className="" id="clientes_sidebar" width="100%">

          <Flex className="" id="clientes_sidebar_shadow" width="100%">
            <Flex className="add_clientes_sidebar" width="100%">


              <Flex className="box_default_top" width="100%">
                <Image onClick={() => handleCloseAddCliente(this)} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
                <Text className="box_default_top_title">
                  <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  NOVO CLIENTE
            </Text>
              </Flex>

              <Flex className="add_clientes_sidebar_list" width="100%">

                {
                  form_cadastro_client.map((e, i) =>
                    <Flex className="input_container" width="100%">
                      <Text>{e.placeholder}</Text>
                      <Input
                        onFocus={() => handleOnFocusInputContainer("form_cadastro_client_input" + e.id, e.type)}
                        onBlur={() => handleOnFocusInputContainer("form_cadastro_client_input" + e.id, e.type)}
                        onMouseLeave={() => handleOnFocusOutInputContainer("form_cadastro_client_input" + e.id)}
                        onKeyDown={() => handleOnFocusInputContainer("form_cadastro_client_input" + e.id, e.type)}
                        onKeyPress={() => handleOnFocusInputContainer("form_cadastro_client_input" + e.id, e.type)}
                        onKeyUp={() => handleOnFocusInputContainer("form_cadastro_client_input" + e.id, e.type)}
                        id={"form_cadastro_client_input" + e.id} className={e.className} placeholder={e.placeholder} />
                    </Flex>
                  )
                }

              </Flex>


              <Flex className="footer">
                <Button onClick={() => handleCloseAddCliente(this)} className="cancelar">
                  cancelar
            </Button>
                <Button onClick={() => handleSaveAddCliente()} className="salvar">
                  salvar
            </Button>
              </Flex>
            </Flex>
          </Flex>

          <Flex className="box_default_top" width="100%">
            <Image onClick={() => handleCloseClientesSidebar(this)} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
            <Text className="box_default_top_title">
              <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  Clientes
            </Text>
            <Button onClick={() => handleAddNewClient(this)} className="clientes_sidebar_buttonadd">
              + novo
            </Button>
          </Flex>
          <Flex className="box_default_body" width="100%">
            <Flex className="flex_clientes_filter">
              <Input
                placeholder="filtrar..."
                onKeyDown={(e) => handleClienteFilter(e)}
                onKeyPress={(e) => handleClienteFilter(e)}
                onKeyUp={(e) => handleClienteFilter(e)}
                className="clientes_input_filter" />
              <Image src="/images/search.webp" className="clientes_input_filter_icon" alt="Barberus" />
              <Image src="/images/close.webp" onClick={(e) => handleClientesFilterClear()} className="clientes_input_filter_clear_icon" alt="Barberus" />
            </Flex>


            <List className="clientes_ul" spacing={3}>
              {/*   { id: 1, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto' }, */
                clientsMockServices.map((e, i) =>
                  <ListItem onClick={() => handleClientesUlClickItem(e)} className="clientes_ul_item" id={"clientes_item" + e.id} key={i}>
                    <Avatar className="avatar_default" name={e.name} /> {e.name}
                    <Text>  {parsePhone(e.whatsapp)} </Text>
                  </ListItem>)
              }
            </List>

            <Flex className="clientes_detalhes">
              <Flex className="no_client_main">
                <Image className="no_client_select_img" src="/images/profile.png" alt="Barberus" />
                <Text className="no_client_select">
                  Selecione um cliente ao lado
              </Text></Flex>
              <Flex className="clientes_detalhe_body">

                <Flex className="instabarber">
                  <Text className="title">InstaBarber</Text>
                  <List className="clientes_instabarber_ul" spacing={3}>

                  </List>
                </Flex>

                <Flex className="agendamentos">
                  <Text className="title">Agendamentos</Text>
                  <Flex className="flex_agendamentos_filter">
                    <Input
                      placeholder="filtrar..."
                      onKeyDown={(e) => handleAgendamentoFilter(e)}
                      onKeyPress={(e) => handleAgendamentoFilter(e)}
                      onKeyUp={(e) => handleAgendamentoFilter(e)}
                      className="agendamento_input_filter" />
                    <Image src="/images/search.webp" className="agendamento_input_filter_icon" alt="Barberus" />
                    <Image src="/images/close.webp" onClick={(e) => handleAgendamentosFilterClear()} className="agendamento_input_filter_clear_icon" alt="Barberus" />
                  </Flex>

                  <List className="clientes_agendamento_ul" spacing={3}>


                  </List>
                  <Flex className="agendamento_buttons_footer">
                    <Button className="cliente_agendamento cliente_button">
                      <Image src="./images/menu_agendamentos.webp" alt="Barberus" />
                Agendar horário
              </Button>
                    <Button onClick={(e) => handleSendWhatsAppMessage()} className="cliente_push cliente_button">
                      <Image src="./images/whatsapp.webp" alt="Barberus" />
                Enviar mensagem
              </Button>
                  </Flex>
                </Flex>


              </Flex>

            </Flex>
          </Flex>
        </Text>

        <Flex className="pop_unidades shadow_components component_container" display="none">
          <ListUnidades></ListUnidades>
        </Flex>

        <Flex className="pop_barbeiros shadow_components component_container" display="none">
          <ListBarbeiros></ListBarbeiros>
        </Flex>

        <Flex className="pop_financeiro shadow_components component_container" display="none">
          <Financeiro></Financeiro>
        </Flex>
        <Flex className="pop_estoques shadow_components component_container" display="none">
          <Estoques></Estoques>
        </Flex>

        <Flex className="pop_agendamentos shadow_components component_container" display="none">
          <Agendamentos></Agendamentos>
        </Flex>

        <PopUpSQL></PopUpSQL>

        <Flex className="box_default" id="cart_sidebar" width="100%">
          <Flex className="box_default_top" width="100%">
            <Image onClick={() => handleCloseCartSidebar(this)} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
            <Text className="box_default_top_title">
              <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  COMANDAS
            </Text>
            <Button onClick={() => handleAddServiceInCart(this)} className="box_default_body_buttonadd">
              + nova
            </Button>
          </Flex>
          <Flex className="box_default_body" width="100%">

            {/* 
            <Image src="/images/search.webp" className=" cart_services_input_filter_icon" alt="Barberus" />*/}

            <Flex className="flex_cart_filter">
              <Input
                placeholder="filtrar..."
                onKeyDown={(e) => handleServiceFilterCart(e)}
                onKeyPress={(e) => handleServiceFilterCart(e)}
                onKeyUp={(e) => handleServiceFilterCart(e)}
                className="cart_services_input_filter" />
              <Image src="/images/search.webp" className=" cart_services_input_filter_icon" alt="Barberus" />
              <Image src="/images/close.webp" onClick={(e) => handleServiceFilterCartClear()} className=" cart_services_input_filter_clear_icon" alt="Barberus" />
            </Flex>
            <Flex className="box_default_body_list" width="100%">

              <List className="cart_services_ul" spacing={3}>
                {/*   { id: 1, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto' }, */
                  clientsMockServices.map((e, i) =>
                    <ListItem onClick={() => handleAddServiceInCartClickItem(e)} className="cart_services_item" id={"cart_list_item" + e.id} key={i}>
                      <Avatar className="avatar_default" name={e.name} /> {e.name}
                      <Text>  {parsePhone(e.whatsapp)} </Text>
                      <Text className="cart_services_item_time">  {e.time} </Text>
                      <Text className="cart_services_item_status" data-name={e.status.toLowerCase()}>  {e.status} </Text>
                    </ListItem>)
                }
              </List>
            </Flex>


            <Flex className="push_form">
              <Flex className="push_header">
                <Text className="push_form_title">
                  <Image onClick={() => handleClosePushForm()} src="/images/close.webp" className="close_push_form" alt="Barberus" />
                  <Text className="push_form_body_button_title">Push Center</Text>
                </Text>
              </Flex>
              <Flex className="push_form_body">
                <Select className="push_form_options" size="lg" >
                  <option value="option1">Todos clientes</option>
                  <option value="option2">Ex clientes</option>
                  <option value="option3">Aniversariantes do mês</option>
                </Select>

                <Textarea placeholder="Escreva sua mensagem aqui..." />

                <Button onClick={() => sendPushMessageClick()} className="push_form_body_button">
                  <Image src="/images/send.webp" alt="Barberus" /> Enviar
                </Button>
              </Flex>
            </Flex>





            <Flex className="box_default_footer" width="100%">
              <Flex className="box_default_footer_top" width="100%">
                <Image onClick={() => handleAddServiceInCartCancelCLickItem()} src="/images/minimize.webp" className="box_default_footer_close" alt="Barberus" />
                <Text className="box_default_footer_top_title"></Text>
              </Flex>
              <List className="cart_products_ul" spacing={3}>
                {/*<OverflowWrapper>*/}
                {

                  productsMockItems.map((e, i) =>
                    <ListItem className="cart_products_item" id={"cart_list_products_item" + e.id} key={i}>
                      <Avatar className="avatar_default" src={e.photo} name={e.name} />
                      <Text className="cart_products_item_1">{e.type.toLowerCase() == 's' ? (e.time + "min") : ("")}  </Text>
                      <Text className="cart_products_item_3">  {e.name} </Text>
                      <Text className="cart_products_item_2">  {"1x " + e.price} </Text>
                    </ListItem>

                  )

                }
                {/*</OverflowWrapper>*/}
              </List>
              <Flex className="cart_comanda_finalizar">
                <Text className="qtd">6 itens</Text>
                <Text className="total">TOTAL:</Text>
                <Text className="valor">R$ 178,90</Text>

                <Button onClick={() => handleAddServiceInCart(this)} className="add_mais_comanda">
                  + adicionar itens
              </Button>
                <Button onClick={() => handleAddServiceInCart(this)} className="fechar_comanda">
                  $ fechar comanda
              </Button>
              </Flex>
            </Flex>

          </Flex>
        </Flex>
      </Flex>

    </Flex >

  )
}


Home.getInitialProps = async ({ req }) => {
  /*  
    let token;
    if (req) {
      // server
      return { _session: {} };
    } else {
      // client
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.API_HOST}/profile`, {
        headers: { token: token },
      });
  
      const _session = await res.json();
      
      console.log("YEP")
      console.log(JSON.stringify(_session))
      console.log("YEP") 
   
      return { _session };
  
    }
   */
  return {}
}
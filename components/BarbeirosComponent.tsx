import { useState, FormEvent } from 'react';
import { Textarea, Select, Flex, Image, Button, Text, useToast, Spinner, List, ListItem, Avatar, AvatarBadge, Divider } from '@chakra-ui/core'
import OverflowWrapper from 'react-overflow-wrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTimes, faColumns } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import $ from 'jquery';
import jsCookie from 'js-cookie';
import axios from 'axios';
var LocalStore = require('localstorejs');
import { useHistory } from "react-router-dom";
import Parser from 'html-react-parser';
import Input from './Input'
import { configs } from '../pages/config.json';


const prefix = "prefix_barbeiros"

const BarbeirosComponent: React.FC = () => {
  const toast = useToast()
  const router = useRouter()
  const API = configs.api
  const AVATAR = configs.avatar

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
      r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "(0$1) $2-$3");
    }
    else if (r.length > 5) {
      // 6..10 digits. Format as 4+4
      r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "(0$1) $2-$3");
    }
    else if (r.length > 2) {
      // 3..5 digits. Add (0XX..)
      r = r.replace(/^(\d\d)(\d{0,5})/, "(0$1) $2");
    }
    else {
      // 0..2 digits. Just add (0XX
      r = r.replace(/^(\d*)/, "(0$1");
    }
    return r;
  }

  var clientsMockServices = [
    { id: 1, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '09:00', status: 'Cortando' },
    { id: 2, name: 'Alicio A. Junior', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '10:00', status: 'Atrasado' },
    { id: 3, name: 'Bruno Brito Fonseca', whatsapp: '15997572550', isBirthdate: true, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '11:00', status: 'Cancelado' },
    { id: 4, name: 'Alberto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '12:00', status: 'Finalizado' },
    { id: 5, name: 'Jair Bolsonaro', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '14:00', status: 'Finalizado' },
    { id: 6, name: 'Luis Inacio Lula da Silva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '15:00', status: 'Finalizado' },
    { id: 7, name: 'Anacleto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '16:00', status: 'Finalizado' },
    { id: 8, name: 'Zion Brito', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '17:00', status: 'Finalizado' },
    { id: 11, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '09:00', status: 'Cortando' },
    { id: 12, name: 'Alicio A. Junior', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '10:00', status: 'Atrasado' },
    { id: 13, name: 'Bruno Brito Fonseca', whatsapp: '15997572550', isBirthdate: true, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '11:00', status: 'Cancelado' },
    { id: 14, name: 'Alberto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '12:00', status: 'Finalizado' },
    { id: 15, name: 'Jair Bolsonaro', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '14:00', status: 'Finalizado' },
    { id: 16, name: 'Luis Inacio Lula da Silva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '15:00', status: 'Finalizado' },
    { id: 17, name: 'Anacleto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '16:00', status: 'Finalizado' },
    { id: 18, name: 'Zion Brito', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '17:00', status: 'Finalizado' },
    , { id: 21, name: 'Beto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '09:00', status: 'Cortando' },
    { id: 22, name: 'Alicio A. Junior', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '10:00', status: 'Atrasado' },
    { id: 23, name: 'Bruno Brito Fonseca', whatsapp: '15997572550', isBirthdate: true, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '11:00', status: 'Cancelado' },
    { id: 24, name: 'Alberto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '12:00', status: 'Finalizado' },
    { id: 25, name: 'Jair Bolsonaro', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '14:00', status: 'Finalizado' },
    { id: 26, name: 'Luis Inacio Lula da Silva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '15:00', status: 'Finalizado' },
    { id: 27, name: 'Anacleto Paiva', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '16:00', status: 'Finalizado' },
    { id: 28, name: 'Zion Brito', whatsapp: '15997572550', isBirthdate: false, photo: './images/default.png', comments: 'Cliente com debitos em aberto', time: '17:00', status: 'Finalizado' },
  ]

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

  function handleClose() {
    $('.shadow_components').fadeOut(150)
    $('#menu_inicio').click()
  }

  function handleOnFocusOutInputContainer(id) {
    if ($("#" + id).val() != undefined && $("#" + id).val().trim().length == 0) {
      $("#" + id).parent().find('p').removeClass('input_selected')
    } else {
      $("#" + id).parent().find('p').removeClass('input_selected_color')
    }
  }

  function phone_formatador(str) {
    return str.replace(/^(\d{2})(\d{5})(\d{4})+$/, "($1)$2-$3");
  }

  var form_barbeiro_component = [
    { id: 0, className: 'id', placeholder: 'Id', type: 'text', disable: true, visible: true, value: "0", editable: false },
    { id: 1, className: 'name', placeholder: 'Nome', type: 'text', disable: true, visible: true, value: "Bruno Brito", editable: true },
    { id: 2, className: 'email', placeholder: 'E-mail', type: 'email', disable: true, visible: true, value: "xbrunots@gmail.com", editable: false },
    { id: 3, className: 'whatsApp', placeholder: 'WhatsApp', type: 'phone', disable: true, visible: true, value: "(15) 997572550", editable: true },
    { id: 4, className: 'nasc', placeholder: 'Data nascimento', type: 'date', disable: true, visible: true, value: "28/04/1988", editable: true },
    { id: 5, className: 'photo', placeholder: 'Foto', type: 'photo', disable: true, visible: false, value: "./images/avatar/afro_man_male_avatar-128.webp", editable: true },
    { id: 6, className: 'percent', placeholder: 'Comissão(%)', type: 'number', disable: true, visible: true, value: 50, editable: true },
    { id: 7, className: 'cpf', placeholder: 'CPF', type: 'cpf', disable: true, visible: true, value: "37017686845", editable: true },
    { id: 8, className: 'rg', placeholder: 'RG', type: 'rg', disable: true, visible: true, value: "441208642", editable: true },
    { id: 9, className: 'cep', placeholder: 'CEP', type: 'cep', disable: true, visible: true, value: "18110090", editable: true },
    { id: 10, className: 'cidade', placeholder: 'Cidade', type: 'text', disable: true, visible: true, value: "Sorocaba", editable: true },
    { id: 11, className: 'estado', placeholder: 'Estado', type: 'text', disable: true, visible: true, value: "São Paulo", editable: true },
    { id: 12, className: 'endereco', placeholder: 'Endereço', type: 'text', disable: true, visible: true, value: "Av. da Gloria em Deus, 223 (casa 3)", editable: true },
    { id: 13, className: 'status', placeholder: 'Status', type: 'status', disable: true, visible: false, value: "ATIVO", editable: true },
    { id: 14, className: 'comments', placeholder: 'Observações', type: 'text', disable: true, visible: true, value: "Vai folgar no natal", editable: true }
  ]

  function handleOnClickClear() {
    $('[property="' + prefix + '"].list_filter_container_input').val("")
    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')
  }

  function handleListItemClick(item) {
    $('[property="' + prefix + '"].list_ul_item').removeClass('list_ul_item_selected')
    $('[property="' + prefix + '"]#list_unidades_item' + item.id).addClass('list_ul_item_selected')
    _openMenu()
  }

  function _openMenu() {
    $('[property="' + prefix + '"].sidebar').animate({ width: '65%' }, 400)
    $('[property="' + prefix + '"].list_filter_container').animate({ width: '35%' }, 400)
    $('[property="' + prefix + '"].list_ul').animate({ width: '35%' }, 400)


  }

  function handleEnableEdit(e) {
    if (!e.editable) {
      toast({
        title: "Oops...",
        description: "Campo " + e.placeholder + " não é editavel!",
        status: "info",
        duration: 4000,
        isClosable: true,
      })
      return
    }
    $('.shadow_of_editing').fadeIn(140)
    $('.form_edit_barber>p').html("digite um novo valor para <strong>" + e.placeholder + "</strong>")
    $('.form_edit_barber>input').attr("placeholder", e.placeholder)
    $('.form_edit_barber>input').attr("data", e.className)
    $('.form_edit_barber>input').attr("data-type", e.type)
    $('.form_edit_barber>input').attr("data-return", "#prefix_barbeiros_form_input" + e.id)
    $('.form_edit_barber>input').attr("where_id", $('#prefix_barbeiros_form_input0').val())
    $('.form_edit_barber>input').attr("table", 'users')
    $('.form_edit_barber>input').val($('#prefix_barbeiros_form_input' + e.id).val())


  }

  function handleOnKeyActionFilter(text) {
    var texto = ($('[property="' + prefix + '"].list_filter_container_input').val()).toLowerCase()
    var tempArray = clientsMockServices

    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')

    tempArray.forEach(x => {
      if (x.name.toLowerCase().includes(texto) ||
        x.status.toLowerCase().includes(texto) ||
        x.whatsapp.toLowerCase().includes(texto) ||
        x.time.toLowerCase().includes(texto)) {

      } else {

        $('[property="' + prefix + '"]#list_unidades_item' + x.id).addClass('item_hide')
      }
    })
  }
  function handleSendWhatsAppMessage() {
    var whatsapp = $('.barber_whatsbutton').attr('data-phone')
    var url = "https://api.whatsapp.com/send?phone=550" + whatsapp.replace("(", "").replace(")", "").replace("-", "").replace(" ", "").trim()
    var win = window.open(url, '_blank');
  }

  function handleAddNewBarber() {
    $('.add_barber_sidebar').animate({
      right: '0%'
    }, 200)
  }

  function handleCloseAddBarberSidebar() {
    handleCloseAddBarber()
  }

  function handleCloseAddBarber() {
    $('.add_barber_sidebar').animate({
      right: '-41%'
    }, 200)
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


  var form_cadastro_barber = [
    { id: 1, className: 'name', placeholder: 'Nome', type: 'text' },
    { id: 2, className: 'email', placeholder: 'E-mail', type: 'email' },
    { id: 3, className: 'whatsApp', placeholder: 'WhatsApp', type: 'phone' },
    { id: 4, className: 'nasc', placeholder: 'Data nascimento', type: 'date' },
    { id: 5, className: 'percent', placeholder: 'Comissão(%)', type: 'number' },
    { id: 6, className: 'comments', placeholder: 'Observações', type: 'text' }
  ]

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

  function loadData() {
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };

    $('.footer>.value').html("")

    axios.get(API + '/profile', config)
      .then(function (response) {

        localStorage.setItem('barberData', JSON.stringify(response.data.barbers))

        inflateBarbeirosArray(function () {

        })

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

  function getbarbeiros() {
    return JSON.parse(localStorage.getItem('barberData'))
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

  function handleSaveAddBarber() {


    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') },
      validateStatus: function (status) {
        return true;
      }
    };

    var nome = $('#form_cadastro_barber_input1').val()
    var email = $('#form_cadastro_barber_input2').val()
    var whats = $('#form_cadastro_barber_input3').val().replace(" ", "").replace("(", "").replace(")", "").replace("+", "").replace("-", "").trim()
    var niver = $('#form_cadastro_barber_input4').val()
    var percent = $('#form_cadastro_barber_input5').val()
    var obs = $('#form_cadastro_barber_input6').val()

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

    if (percent == undefined || percent == null || parseInt(percent) == NaN || parseInt(percent) == undefined) {
      toast({
        title: "Oops!",
        description: "Comissão inválida!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      return
    }


    if (parseInt(percent) > 100) {
      percent = 100
    }

    var aniversario = niver.split("/")[2] + niver.split("/")[1] + niver.split("/")[0]


    const random = Math.floor(Math.random() * AVATAR.length);
    var avatar = AVATAR[random]

    var jsonData = {
      name: nome,
      email: email,
      whatsapp: whats,
      birth_date: aniversario,
      percent: percent,
      comments: obs,
      photo: avatar
    }

    axios.post(API + '/users', jsonData, config)
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
          jsonData.id = response.data.insertId
          loadData()
          handleCloseAddBarber()
          toast({
            title: "Uhul!",
            description: nome + " cadastrado com sucesso!",
            status: "success",
            duration: 4000,
            isClosable: true,
          })

        } else {
          toast({
            title: "Oops!¹",
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
          title: "Oops!²",
          description: "Dados incorretos, verifique o formulário e tente novamente!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
      });
  }

  return (<Flex className="list_main" property={prefix}>

    <Flex className="add_barber_sidebar" width="100%">
      <Flex className="box_default_top" width="100%">
        <Image onClick={() => handleCloseAddBarberSidebar()} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
        <Text className="box_default_top_title">
          <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  NOVO BARBEIRO
</Text>
      </Flex>

      <Flex className="add_barber_sidebar_list" width="100%">

        {
          form_cadastro_barber.map((e, i) =>
            <Flex className="input_container" width="100%">
              <Text>{e.placeholder}</Text>
              <Input
                onFocus={() => handleOnFocusInputContainer("form_cadastro_barber_input" + e.id, e.type)}
                onBlur={() => handleOnFocusInputContainer("form_cadastro_barber_input" + e.id, e.type)}
                onMouseLeave={() => handleOnFocusOutInputContainer("form_cadastro_barber_input" + e.id)}
                onKeyDown={() => handleOnFocusInputContainer("form_cadastro_barber_input" + e.id, e.type)}
                onKeyPress={() => handleOnFocusInputContainer("form_cadastro_barber_input" + e.id, e.type)}
                onKeyUp={() => handleOnFocusInputContainer("form_cadastro_barber_input" + e.id, e.type)}
                id={"form_cadastro_barber_input" + e.id} className={e.className} placeholder={e.placeholder} />
            </Flex>
          )
        }

      </Flex>


      <Flex className="footer">
        <Button onClick={() => handleCloseAddBarber()} className="cancelar">
          cancelar
</Button>
        <Button onClick={() => handleSaveAddBarber()} className="salvar">
          salvar
</Button>
      </Flex>
    </Flex>



    <Flex className="sidebar" property={prefix}>
      <Flex className="no_barbeiros_main">
        <Image className="no_barbeiro_select_img" src="/images/barbeiro.webp" alt="Barberus" />
        <Text className="no_barbeiro_select">
          Selecione um barbeiro ao lado
              </Text></Flex>
      <Flex className="header" property={prefix}>
        <Flex className="bg_header"></Flex>
        <Image property={prefix} src="/images/avatar/hipster_beard_male_man-128.webp" className="sideabar_photo" alt="Barberus" />
        <Text property={prefix} className="sideabar_name">Betinho Barbeiro</Text>

      </Flex>
      <Button onClick={() => handleAddNewBarber()} className="barber_buttonadd">
        + novo
            </Button>
      <Flex className="body" property={prefix}>

        <Text className="shadow_of_editing">
          <Flex className="container">

          </Flex>

        </Text>

        {
          form_barbeiro_component.map((e, i) =>
            <Flex property={prefix} className={"parent"} onClick={() => handleEnableEdit(e)}  >
              <Flex className={"input_container visible_" + e.visible} width="100%" property={prefix}>
                <Text className="input_selected" property={prefix}>{e.placeholder}</Text>
                <Input disabled property={prefix} className={"form_disable_" + e.disable + " " + e.className}
                  onFocus={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                  onBlur={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                  onMouseLeave={() => handleOnFocusOutInputContainer(prefix + "_form_input" + e.id)}
                  onKeyDown={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                  onKeyPress={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                  onKeyUp={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                  id={prefix + "_form_input" + e.id} placeholder={e.placeholder} />
              </Flex>
            </Flex>
          )
        }
        <Button property={prefix} onClick={(e) => handleSendWhatsAppMessage()} className="cliente_push cliente_button send_message barber_whatsbutton">
          <Image src="./images/whatsapp.webp" alt="Barberus" /> Enviar mensagem
        </Button>
      </Flex>

      { /*
      <Flex className="footer" property={prefix}>
        <Button onClick={() => handleCancelEdit()} className="cancelar">
          cancelar
            </Button>
        <Button onClick={() => handleOkEdit()} className="salvar">
          salvar
            </Button>
      </Flex> */
      }
    </Flex>

    <Flex property={prefix} className="list_header">
      <Text className="list_header_title" property={prefix}>
        <Image property={prefix} src="/images/close.webp" onClick={() => handleClose()} className="list_header_close" alt="Barberus" />
        <Text property={prefix} className="push_form_body_button_title">Barbeiros</Text>
      </Text>
    </Flex>

    <Flex property={prefix} className="list_filter_container">
      <Input property={prefix}
        placeholder="filtrar..."
        onKeyDown={(e) => handleOnKeyActionFilter(e)}
        onKeyPress={(e) => handleOnKeyActionFilter(e)}
        onKeyUp={(e) => handleOnKeyActionFilter(e)}
        className="list_filter_container_input" />
      <Image property={prefix} src="/images/search.webp" alt="Barberus" />
      <Image property={prefix} src="/images/close.webp" onClick={(e) => handleOnClickClear()} className="list_filter_container_clear_icon" alt="Barberus" />
    </Flex>

    <List property={prefix} className="list_ul" spacing={3}>
      {
        clientsMockServices.map((e, i) =>
          <ListItem property={prefix} onClick={() => handleListItemClick(e)} className="list_ul_item" id={"list_unidades_item" + e.id} key={i}>
            <Avatar property={prefix} className="avatar_default" name={e.name} /> {e.name}
            < Text property={prefix} >  {parsePhone(e.whatsapp)} </Text>
          </ListItem>)
      }
    </List></Flex>
  );
}


export default BarbeirosComponent;
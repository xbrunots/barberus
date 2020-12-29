import { useState, FormEvent } from 'react';
import { Link, Flex, Image, Button, Text, useToast, Spinner, List, ListItem, Avatar, AvatarBadge } from '@chakra-ui/core'
import OverflowWrapper from 'react-overflow-wrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTimes, faColumns } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import $ from 'jquery';
import jsCookie from 'js-cookie';
import Input from '../../components/Input'
import axios from 'axios';
var LocalStore = require('localstorejs');
import { useHistory } from "react-router-dom";
import Parser from 'html-react-parser';


export default function Home({ _email, _session }) {

  const [email, setEmail] = useState(_email);
  const [session, setSession] = useState(_session);
  const toast = useToast()
  const router = useRouter()

  let history = useHistory();

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
    return;

    if ($('.pictureOpenSidebarLeft').hasClass('pictureOpenSidebarLeft_active')) {
      $('.pictureOpenSidebarLeft').removeClass('pictureOpenSidebarLeft_active')
      $('.home_sidebar_left').animate({
        left: '-310px'
      }, 200)
    } else {
      $('.pictureOpenSidebarLeft').addClass('pictureOpenSidebarLeft_active')
      $('.home_sidebar_left').animate({
        left: '0px'
      }, 200)
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

  function handleAddServiceInCartClickItem(item) {
    $('.cart_services_item').removeClass('cart_item_selected')
    $('#cart_list_item' + item.id).addClass('cart_item_selected')
    $('.box_default_footer').animate({
      right: '0px'
    }, 200)
    $('.box_default_footer_top_title').html("<B>Comanda de</B> " + item.name)
  }

  function handleClientesUlClickItem(item) {
    $('.clientes_ul_item').removeClass('clientes_item_selected')
    $('#clientes_item' + item.id).addClass('clientes_item_selected')
    // $('.box_default_footer').animate({
    //    right: '0px'
    //  }, 200)
    //$('.box_default_footer_top_title').html("<B>Comanda de</B> " + item.name)

    $('.no_client_select_img').fadeOut(50)
    $('.no_client_select').fadeOut(50)
    $('.clientes_detalhe_body').css('opacity', 1)
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').text(item.name)
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').attr('whatsapp', item.whatsapp)
  }


  function closeClistesUICLickItem() {
    $('.clientes_ul_item').removeClass('clientes_item_selected')
    $('.no_client_select_img').fadeIn(50)
    $('.no_client_select').fadeIn(50)
    $('.clientes_detalhe_body').css('opacity', 0)
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').text("clientes")
    $('#clientes_sidebar>.box_default_top>.box_default_top_title').attr('whatsapp', "")
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
    $('#clientes_sidebar').animate({
      top: '120%'
    }, 200)
    handlerClickMenuSidebarLeft("menu_inicio")
    closeClistesUICLickItem()
  }

  function handleClientesOpen() {
    $('.__shadow').fadeIn(500)
    $('#clientes_sidebar').animate({
      top: '3%'
    }, 200)
    handlerClickMenuSidebarLeft("menu_clientes")
  }

  function handlerClickMenuSidebarLeft(context) {
    $('.sidebar_left_menu_item').removeClass('sidebar_left_menu_item_selected')
    $("#" + context).addClass('sidebar_left_menu_item_selected')
    router.push({
      pathname: '/app/',
      hash: context.replace("menu_", "")
    })
  }

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

  return (
    <Flex
      as="main"
      width="100%"
      justifyContent="center"
      alignItems="center"
    >

      {Parser('<div class="__shadow"></div>')}


      <Button className="fab_carrinho" onClick={() => handleOpenCartSidebar(this)}>
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
          src={_session.photo}
          alt={_session.email}
          onClick={() => handlePhotoClick(this)}
        />
      </Flex>
      <Flex height="100%" width="300px" className="home_sidebar_right">
        <Flex className="home_sidebar_right_header"
          height="170px" width="100%"
          justifyContent="center"
          alignItems="center">
          <Text textAlign="center" className="home_sidebar_right_header_thumb"  >

          </Text>
          <FontAwesomeIcon
            onClick={() => handleCloseSidebarRight(this)} className="back_button back_button_header" icon={faTimes} />

          <Image id="homeHeaderImageLogo"
            borderRadius="50%"
            height="40px"
            src={_session.photo}
            alt={_session.email}
            onClick={() => handleCloseSidebarRight(this)}
          />

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
                {_session.userName}
              </Text>
              <Text textAlign="center" className="homeSidebarRightHeaderTextTypeName" fontSize="12px" onClick={() => handlePhotoClick(this)} >
                {_session.typeName}
              </Text></Flex>
          </Flex>

          <Flex className="container_body">
            <Text textAlign="center" className="homeSidebarRightHeaderTextEmail" fontSize="14px" onClick={() => handlePhotoClick(this)} >
              {_email}
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
          <Button id="menu_agendamento" onClick={(e) => handlerClickMenuSidebarLeft("menu_agendamento")} className="sidebar_left_menu_item" variant="solid">
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
            /> <Text>Push</Text>
          </Button>
          <Button id="menu_clientes" onClick={(e) => handleClientesOpen()} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_clients.webp"
              alt="Início"
            />  <Text>Clientes</Text>
          </Button>
          <Button id="menu_unidades" onClick={(e) => handlerClickMenuSidebarLeft("menu_unidades")} className="sidebar_left_menu_item" variant="solid">
            <Image className="pic"
              height="40px"
              src="./images/menu_unidades.webp"
              alt="Início"
            />   <Text>Unidades</Text>
          </Button>
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
          <Text className="resumo_title">Resumo</Text>

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


        <Flex className="" id="clientes_sidebar" width="100%">
          <Flex className="box_default_top" width="100%">
            <Image onClick={() => handleCloseClientesSidebar(this)} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
            <Text className="box_default_top_title">
              <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  CLIENTES
            </Text>
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
              <Image className="no_client_select_img" src="/images/profile.png" alt="Barberus" />
              <Text className="no_client_select">
                Selecione um cliente ao lado
              </Text>
              <Flex className="clientes_detalhe_body">

                <Flex className="instabarber">
                  <Text className="title">InstaBarber</Text>
                  <List className="clientes_instabarber_ul" spacing={3}>
                    <OverflowWrapper>
                      {
                        clienteDetalhes[0].instabarber.map((e, i) =>
                          <ListItem className="clientes_instabarber_li" id={"clientes_instabarber_item" + e.id} key={i}>
                            <Avatar className="avatar_default gradient_instagram" src={e.photo} />
                            <Flex className="social">
                              <Text className="item1 item">   <Image className="likes" src="/images/like.webp" alt="Barberus" /> {e.likes} </Text>
                              <Text className="item2 item">  <Image className="shares" src="/images/share.webp" alt="Barberus" />  {e.shares} </Text>
                              <Text className="item3 item">  <Image className="comments" src="/images/comment.webp" alt="Barberus" />  {e.comments} </Text>
                            </Flex></ListItem>
                        )
                      }
                    </OverflowWrapper>
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
                    <ListItem className="clientes_agendamento_li clientes_agendamento_head"  >

                      <Flex className="row">
                        <Text className="item1 item head">     Data </Text>
                        <Text className="item2 item head">   Descrição </Text>
                        <Text className="item3 item head">    Valor </Text>
                        <Text className="item4 item head">    Status </Text>
                        <Text className="item5 item head">     Tempo </Text>
                      </Flex></ListItem>

                    {/*       { id: 1, date: 20201201, hour: 10.30, name: 'Corte+Barba', price: 25.90, status: 'finalizado' }, */
                      clienteDetalhes[0].agendamentos.map((e, i) =>
                        <ListItem className="clientes_agendamento_li" data-name="row" id={"clientes_agendamento_item" + e.id} key={i}>

                          <Flex className="row">
                            <Text className="item1 item">    {parseDate(e.date) + " " + parseHour(e.hour)} </Text>
                            <Text className="item2 item">    {e.name} </Text>
                            <Text className="item3 item">    {parseMoney(e.price)} </Text>
                            <Text className="item4 item" data-name={e.status}>     {e.status} </Text>
                            <Text className="item5 item">     {e.time + " min"} </Text>
                          </Flex></ListItem>
                      )
                    }
                  </List>
                </Flex>

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


        <Flex className="box_default" id="cart_sidebar" width="100%">
          <Flex className="box_default_top" width="100%">
            <Image onClick={() => handleCloseCartSidebar(this)} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
            <Text className="box_default_top_title">
              <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  COMANDAS
            </Text>
          </Flex>
          <Flex className="box_default_body" width="100%">
            <Button onClick={() => handleAddServiceInCart(this)} className="box_default_body_buttonadd">
              + nova
            </Button>
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


Home.getInitialProps = async (ctx) => {
  var email = 'xbrunots@gmail.com'
  var token = 'no-token'
  var sessionData = {
    _id: "5fe7814e0378071e7aaf6e07",
    email: "xbrunots@gmail.com",
    password: null,
    status: 1,
    type: 99,
    createAt: "2020 - 12 - 26T18: 30: 38.847Z",
    token: "NO - TOKEN",
    photo: "./images/default.png",
    typeName: 'owner',
    userName: 'Fulano Dital'
  }

  var type = 'owner'
  if (sessionData.type == 99) {
    type = 'owner';

  } else if (sessionData.type == 0) {
    type = 'manager';

  } else if (sessionData.type == 1) {
    type = 'barber';

  } else if (sessionData.type == 2) {
    type = 'franchise';

  } else if (sessionData.type == 3) {
    type = 'secretary';
  } else {
    type = 'Barber';
  }

  sessionData.typeName = type

  return { _email: email, _session: sessionData }
}
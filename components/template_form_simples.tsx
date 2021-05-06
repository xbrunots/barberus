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

const prefix = "prefix_unidades"

const ListUnidades: React.FC = () => {

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


  function handleOnClickClear() {
    $('[property="' + prefix + '"].list_filter_container_input').val("")
    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')
  }

  function handleListItemClick(item) {
    $('[property="' + prefix + '"].list_ul_item').removeClass('list_ul_item_selected')
    $('[property="' + prefix + '"]#list_unidades_item' + item.id).addClass('list_ul_item_selected')
  }

  function handleClose() {
    $('.shadow_components').fadeOut()
    $('#menu_inicio').click()
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

  return (<Flex className="list_main" property={prefix}>
    <Flex property={prefix} className="list_header">
      <Text className="list_header_title" property={prefix}>
        <Image property={prefix} src="/images/close.webp" onClick={() => handleClose()} className="list_header_close" alt="Barberus" />
        <Text property={prefix} className="push_form_body_button_title">Unidades</Text>
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
          <ListItem property={prefix} onClick={() => handleListItemClick(e)}
            className="list_ul_item" id={"list_unidades_item" + e.id} key={i}>
            <Avatar property={prefix} className="avatar_default" name={e.name} /> {e.name}
            < Text property={prefix} >  {parsePhone(e.whatsapp)} </Text>
          </ListItem>)
      }
    </List></Flex>
  );
}


export default ListUnidades;
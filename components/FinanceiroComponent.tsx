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
var dayjs = require('dayjs')
import { configs } from '../pages/config.json';

const prefix = "prefix_financeiro"

const ListUnidades: React.FC = () => {
  const toast = useToast()
  const router = useRouter()
  const API = configs.api

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

  var arrayFinancialsData = [
    { id: 9, type: 'DESPESA', name: '-', date: 20211229, category: 'COMISSÕES', desc: '', comments: 'Pagamento de comissão (Bento)', value: 3550.90, },
  ]

  function getUser() {
    return JSON.parse(localStorage.getItem('userData'))
  }

  function loadFinancials(range, text) {
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };
    var dateFull = dayjs().format('YYYYMMDD')
    var year = dateFull.toString()[0] + dateFull.toString()[1] + dateFull.toString()[2] + dateFull.toString()[3]
    var month = dateFull.toString()[4] + dateFull.toString()[5]
    var day = dateFull.toString()[6] + dateFull.toString()[7]

    var rangeDate = ""
    var between = rangeDate + ":" + year + month + day

    var newDay = day
    var newMonth = month
    var newYear = year

    if (range == null) {
      rangeDate = year + month + day
    } else if (range > 0) {

      if (parseInt(day) == range) {
        newDay = "01"
      }
      if (parseInt(day) > range) {
        if ((parseInt(day) - range).toString().length < 2) {
          newDay = "0" + (parseInt(day) - range).toString()
        } else {
          newDay = (parseInt(day) - range).toString()
        }
      }
      if (parseInt(day) < range) {
        //tratando o dia
        newDay = (parseInt(day) - 30).toString()
        if (parseInt(newDay).toString().length < 2) {
          newDay = "0" + parseInt(newDay)
        }
        //-------------
        //tratando o mes
        if (parseInt(month) > 1) {
          newMonth = month - 1
        }
        if (parseInt(month) == 1) {
          year = year - 1
          newMonth = "12"
        }
      }
      rangeDate = newYear + newMonth + newDay
      between = rangeDate + ":" + year + month + day
    } else if (range == 0) { //esse mes
      newDay = "01"
      newMonth = month
      newYear = year
      rangeDate = newYear + newMonth + newDay
      between = rangeDate + ":" + year + newMonth + "31"
    } else if (range == -1) { //esse ano
      newDay = "01"
      newMonth = "01"
      newYear = year
      rangeDate = newYear + newMonth + newDay
      between = rangeDate + ":" + year + "12" + "31"
    }

    var bodyJson = { user_id: getUser().id }

    axios.post(API + '/financials/' + between, bodyJson, config)
      .then(function (response) {
        $('[property="prefix_financeiro"].list_ul').html(" ")
        $('[property="prefix_financeiro"].footer>.value').html(parseMoney(response.data.infos.moneyTotal))

        $('.push_form_body_button_sub_title').html(text + " (" + response.data.infos.rows + " itens)")

        arrayFinancialsData = []
        arrayFinancialsData = response.data.data
        $.each(response.data.data, function (i, e) {
          var commentarios = ""
          if (e.comments != null && e.comments != undefined) { commentarios = e.comments }
          var tipo = "SERVIÇO"
          var status = "RECEITA"
          if (e.type == 1) {
            tipo = "SERVIÇO"
          } else {
            tipo = "PRODUTO"
          }

          if (e.status == 1) {
            status = "RECEITA"
          } else {
            status = "DESPESA"
          }

          var rowAgendamento = ` <li property="prefix_financeiro"
        class="list_ul_item status`+ e.status + `" id="list_unidades_item"` + e.id + ` key="` + e.id + `">
        <p property="prefix_financeiro"  class="service item"> `+ status + `   </p> 
        <p property="prefix_financeiro"  class="type item"> `+ tipo + `   </p>
<p property="prefix_financeiro" class="description item">`+ e.description + `      </p> 
<p property="prefix_financeiro" class="comments item">`+ commentarios + `      </p> 
<p property="prefix_financeiro" class="value item">`+ parseMoney(e.price) + `   </p> 
<p property="prefix_financeiro" class="date item"> `+ parseDate(e.date) + `    </p> 
</li>`
          $('[property="prefix_financeiro"].list_ul').append(rowAgendamento)
        });
        $('.in_load').fadeOut()
      })
      .catch(function (error) {
        console.log(error)
        toast({
          title: "Oops!",
          description: "Falha interna!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
        $('.in_load').fadeOut()
      });
  }

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
    var tempArray = arrayFinancialsData

    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')

    tempArray.forEach(x => {
      if (x.type.toLowerCase().includes(texto) ||
        x.category.toLowerCase().includes(texto) ||
        x.comments.toLowerCase().includes(texto) ||
        x.value.toString().toLowerCase().includes(texto) ||
        x.desc.toLowerCase().includes(texto)) {

      } else {

        $('[property="' + prefix + '"]#list_unidades_item' + x.id).addClass('item_hide')
      }
    })
  }

  function filter_select(className, dias) {
    $('[property="prefix_financeiro"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.' + className).find('.in_load').fadeIn()
    if (parseInt(dias) == 1) {
      $('.push_form_body_button_sub_title').html("hoje")
      loadFinancials(dias, "hoje")
    } else {
      $('.push_form_body_button_sub_title').html("últimos " + dias + " dias")
      loadFinancials(dias, "últimos " + dias + " dias")
    }
  }
  function filter_select_mes(className) {
    $('[property="prefix_financeiro"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.' + className).find('.in_load').fadeIn()
    $('.push_form_body_button_sub_title').html("esse mês")
    loadFinancials(0, "esse mês")
  }
  function filter_select_ano(className) {
    $('[property="prefix_financeiro"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.push_form_body_button_sub_title').html("esse ano")
    $('.' + className).find('.in_load').fadeIn()
    loadFinancials(-1, "esse ano")
  }

  function toggleLookMoney() {
    var open = $('[property="prefix_financeiro"].footer>.look').hasClass('open')

    if (open) {
      $('[property="prefix_financeiro"].footer>.look').removeClass('open')
      $('[property="prefix_financeiro"].footer>.look').attr('src', './images/close_eye.webp')
      $('[property="prefix_financeiro"].footer>.value').addClass('hidden')
    } else {
      $('[property="prefix_financeiro"].footer>.look').addClass('open')
      $('[property="prefix_financeiro"].footer>.look').attr('src', './images/open_eye.webp')
      $('[property="prefix_financeiro"].footer>.value').removeClass('hidden')
    }
  }

  return (<Flex className="list_main" property={prefix}>
    <Flex property={prefix} className="list_header">
      <Text className="list_header_title" property={prefix}>
        <Image property={prefix} src="/images/close.webp" onClick={() => handleClose()} className="list_header_close" alt="Barberus" />
        <Text property={prefix} className="push_form_body_button_title">Financeiro</Text>
        <Text property={prefix} className="push_form_body_button_sub_title">hoje </Text>
      </Text>
    </Flex>
    <Flex property={prefix} className="filters_containers" >

      <Button onClick={(e) => filter_select('hoje', 1)} className="item hoje selected">
        <Spinner className="in_load" size="xl" />  Hoje
      </Button>
      <Button onClick={(e) => filter_select('_7dias', 7)} className="item _7dias">
        <Spinner className="in_load" size="xl" />  7 dias
      </Button>
      <Button onClick={(e) => filter_select('_15dias', 15)} className="item _15dias">
        <Spinner className="in_load" size="xl" />  15 dias
      </Button>
      <Button onClick={(e) => filter_select('_28dias', 28)} className="item _28dias">
        <Spinner className="in_load" size="xl" />  28 dias
      </Button>
      <Button onClick={(e) => filter_select_mes('essemes')} className="item essemes">
        <Spinner className="in_load" size="xl" />   Esse mês
      </Button>
      <Button onClick={(e) => filter_select_ano('esseano')} className="item esseano">
        <Spinner className="in_load" size="xl" />  Esse ano
      </Button>

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
    <Flex property={prefix} className="list_ul_item header" id={"list_unidades_item_header"} key='-1'>
      <Text property={prefix} className="type item">  Movimento   </Text>
      <Text property={prefix} className="category item"> Tipo</Text>
      <Text property={prefix} className="desc item"> Descrição </Text>
      <Text property={prefix} className="comments item"> Comentários   </Text>
      <Text property={prefix} className="value item"> Valor  </Text>
      <Text property={prefix} className="date item"> Data   </Text>
    </Flex>
    <List property={prefix} className="list_ul" spacing={3}>

    </List>
    <Flex property={prefix} className="total_container footer">
      <Text property={prefix} className="title"> Total:   </Text>
      <Text property={prefix} className="value hidden"> {parseMoney(12039.34)}   </Text>
      <Image onClick={() => toggleLookMoney()} property={prefix} className="look" src="./images/close_eye.webp" />
    </Flex>
  </Flex >
  );
}


export default ListUnidades;
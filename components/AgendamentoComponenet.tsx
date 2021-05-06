import { useState, FormEvent } from 'react';
import { Tooltip, Textarea, Select, Flex, Image, Button, Text, useToast, Spinner, List, ListItem, Avatar, AvatarBadge, Divider } from '@chakra-ui/core'
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
import { stat } from 'fs';
var dayjs = require('dayjs')
import { configs } from '../pages/config.json';

const prefix = "prefix_agendamentos"

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
    console.log(hr.toString())

    var hour = hr.toString()
    if (hour.length == 2) {
      hour = hour + ".00"
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

  var mockAgendamento = []

  function handleOnClickClear() {
    $('[property="' + prefix + '"].list_filter_container_input').val("")
    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')
  }

  function handleListItemClick(item) {
    $('[property="' + prefix + '"].list_ul_item').removeClass('list_ul_item_selected')
    $('[property="' + prefix + '"]#list_unidades_item' + item.id).addClass('list_ul_item_selected')
  }

  function handleOnKeyActionFilter(text) {
    var texto = ($('[property="' + prefix + '"].list_filter_container_input').val()).toLowerCase()
    var tempArray = mockAgendamento
    console.log(texto)
    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')

    tempArray.forEach(x => {
      console.log("TOP " + texto)
      if (toStatusName(x.status).toLowerCase().includes(texto) ||
        x.whatsapp != undefined && x.whatsapp.toLowerCase().includes(texto) ||
        x.comments != undefined && x.comments.toLowerCase().includes(texto) ||
        x.price != undefined && parseMoney(x.price).toString().toLowerCase().includes(texto) ||
        x.date != undefined && parseDate(x.date).toString().toLowerCase().includes(texto) ||
        x.hour != undefined && parseHour(x.hour).toString().toLowerCase().includes(texto) ||
        x.clients_name != undefined && (x.clients_name).toString().toLowerCase().includes(texto) ||
        x.name != undefined && x.name.toLowerCase().includes(texto)) {
        console.log("ENTROU " + texto)
      } else {
        console.log("ELSE " + texto)

        $('[property="' + prefix + '"]#list_unidades_item' + x.id).addClass('item_hide')
      }
    })
  }


  function toStatusName(str) {
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

  function getUser() {
    return JSON.parse(localStorage.getItem('userData'))
  }

  function loadDataAgendamentos(range, text) {
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



    axios.get(API + '/calendars/' + between, config)
      .then(function (response) {
        $('[property="prefix_agendamentos"].list_ul').html(" ")
        $('[property="prefix_agendamentos"].footer>.value').html(parseMoney(response.data.infos.moneyTotal))

        $('.push_form_body_button_sub_title').html(text + " (" + response.data.infos.rows + " itens)")



        mockAgendamento = []
        mockAgendamento = response.data.data
        $.each(response.data.data, function (i, e) {
          var commentarios = ""
          if (e.comments != null && e.comments != undefined) { commentarios = e.comments }


          var rowAgendamento = ` <li property="prefix_agendamentos"
        class="list_ul_item status`+ e.status + ` " data-status="` + toStatusName(e.status).toLowerCase() + `" id="list_unidades_item` + e.calendars_id + `" key="` + e.calendars_id + `">
<p property="prefix_agendamentos"  class="service item"> `+ e.name + `   </p>
<p property="prefix_agendamentos" class="date item"> `+ parseDate(e.date) + `    </p>
<p property="prefix_agendamentos" class="hour item"> `+ parseHour(e.hour) + `   </p>
<p property="prefix_agendamentos" class="cliente item"> `+ e.clients_name + ` </p>
<p property="prefix_agendamentos" class="whatsapp item"> `+ parsePhone(e.whatsapp) + `  </p>
<p property="prefix_agendamentos" class="value item">`+ parseMoney(e.price) + `   </p>
<p property="prefix_agendamentos" class="time item"> `+ toStatusName(e.status) + `  </p> 
<p property="prefix_agendamentos" class="comments item">`+ commentarios + `      </p> 
</li>`
          $('[property="prefix_agendamentos"].list_ul').append(rowAgendamento)
        });
        $('.in_load').fadeOut()
      })
      .catch(function (error) {
        console.log(error)
        toast({
          title: "Oops!",
          description: "Falha interna!",
          status: "error",
          duration: 8000,
          isClosable: true,
        })
        $('.in_load').fadeOut()
      });
  }

  function filter_select(className, dias) {
    $('[property="prefix_agendamentos"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.' + className).find('.in_load').fadeIn()
    if (parseInt(dias) == 1) {
      $('.push_form_body_button_sub_title').html("hoje")
      loadDataAgendamentos(dias, "hoje")
    } else {
      $('.push_form_body_button_sub_title').html("últimos " + dias + " dias")
      loadDataAgendamentos(dias, "últimos " + dias + " dias")
    }
  }
  function filter_select_mes(className) {
    $('[property="prefix_agendamentos"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.' + className).find('.in_load').fadeIn()
    $('.push_form_body_button_sub_title').html("esse mês")
    loadDataAgendamentos(0, "esse mês")
  }
  function filter_select_ano(className) {
    $('[property="prefix_agendamentos"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.push_form_body_button_sub_title').html("esse ano")
    $('.' + className).find('.in_load').fadeIn()
    loadDataAgendamentos(-1, "esse ano")
  }

  function toggleLookMoney() {
    var open = $('[property="prefix_agendamentos"].footer>.look').hasClass('open')

    if (open) {
      $('[property="prefix_agendamentos"].footer>.look').removeClass('open')
      $('[property="prefix_agendamentos"].footer>.look').attr('src', './images/close_eye.webp')
      $('[property="prefix_agendamentos"].footer>.value').addClass('hidden')
    } else {
      $('[property="prefix_agendamentos"].footer>.look').addClass('open')
      $('[property="prefix_agendamentos"].footer>.look').attr('src', './images/open_eye.webp')
      $('[property="prefix_agendamentos"].footer>.value').removeClass('hidden')
    }
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
  function getServices() {
    return JSON.parse(localStorage.getItem('servicesData'))
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

    if (type == "services") {
      //
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

  function handleSendWhatsAppMessage() {
    var whatsapp = $('.agendamento_whatsbutton').attr('data-phone')
    var url = "https://api.whatsapp.com/send?phone=550" + whatsapp.replace("(", "").replace(")", "").replace("-", "").replace(" ", "").trim()
    var win = window.open(url, '_blank');
  }

  function handleAddNewAgendamento() {
    $('.add_agendamento_sidebar').animate({
      right: '0%'
    }, 200)
  }

  function handleCloseAddAgendamentoSidebar() {
    handleCloseAddAgendamento()
  }

  function handleCloseAddAgendamento() {
    $('.add_agendamento_sidebar').animate({
      right: '-41%'
    }, 200)
  }

  function handleSaveAddAgendamento() {
    handleCloseAddAgendamentoSidebar()
  }

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  var form_agendamento = [
    { id: 1, className: 'service', placeholder: 'Serviço', type: 'services', visible: true, editable: true, tooltip: "Digite para buscar os serviços..." },
    { id: 2, className: 'date', placeholder: 'Data', type: 'date', visible: true, editable: true, tooltip: "Digite a data" },
    { id: 3, className: 'hour', placeholder: 'Hora', type: 'time', visible: true, editable: true, tooltip: "Digite a hora" },
    { id: 4, className: 'client', placeholder: 'Cliente', type: 'text', visible: true, editable: true, tooltip: "Digite para buscar os clientes..." },
    { id: 5, className: 'whatsApp', placeholder: 'WhatsApp', type: 'phone', visible: true, editable: false, tooltip: "" },
    { id: 6, className: 'price', placeholder: 'Valor', type: 'money', visible: true, editable: false, tooltip: "" },
    { id: 7, className: 'comments', placeholder: 'Observações', type: 'text', visible: true, editable: true, tooltip: "Deixe alguma observação sobre esse cliente ou mesmo sobre o agendamento..." }
  ]

  return (<Flex className="list_main" property={prefix}>
    <Flex className="add_agendamento_sidebar" width="100%">
      <Flex className="box_default_top" width="100%">
        <Image onClick={() => handleCloseAddAgendamentoSidebar()} src="/images/close.webp" className="box_default_top_close" alt="Agendamentous" />
        <Text className="box_default_top_title">
          <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Agendamentous" />  NOVO AGENDAMENTO
</Text>
      </Flex>

      <Flex className="add_agendamento_sidebar_list" width="100%">

        {
          form_agendamento.map((e, i) =>
            <Flex className="input_container" width="100%">
              <Text>{e.placeholder}</Text>
              <Tooltip label={e.tooltip} aria-label="A tooltip">
                <Input
                  onFocus={() => handleOnFocusInputContainer("form_cadastro_agendamento_input" + e.id, e.type)}
                  onBlur={() => handleOnFocusInputContainer("form_cadastro_agendamento_input" + e.id, e.type)}
                  onMouseLeave={() => handleOnFocusOutInputContainer("form_cadastro_agendamento_input" + e.id)}
                  onKeyDown={() => handleOnFocusInputContainer("form_cadastro_agendamento_input" + e.id, e.type)}
                  onKeyPress={() => handleOnFocusInputContainer("form_cadastro_agendamento_input" + e.id, e.type)}
                  onKeyUp={() => handleOnFocusInputContainer("form_cadastro_agendamento_input" + e.id, e.type)}
                  id={"form_cadastro_agendamento_input" + e.id} className={e.className} placeholder={e.placeholder} />
              </Tooltip>
            </Flex>
          )
        }

      </Flex>


      <Flex className="footer">
        <Button onClick={() => handleCloseAddAgendamento()} className="cancelar">
          cancelar
</Button>
        <Button onClick={() => handleSaveAddAgendamento()} className="salvar"> {/*handleSaveAddAgendamento */}
          salvar
</Button>
      </Flex>
    </Flex>




    <Text className="__container_loading">
      <Spinner size="xl" />
      <Text>Verificando agendamentos...</Text>
    </Text>

    <Flex property={prefix} className="list_header">
      <Text className="list_header_title" property={prefix}>
        <Image property={prefix} src="/images/close.webp" onClick={() => handleClose()} className="list_header_close" alt="Agendamentous" />
        <Text property={prefix} className="push_form_body_button_title">Agendamentos </Text>
        <Text property={prefix} className="push_form_body_button_sub_title">hoje </Text>
      </Text>
      <Button onClick={() => handleAddNewAgendamento()} className="_agendamento__buttonadd">
        + novo
            </Button>
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
      <Image property={prefix} src="/images/search.webp" alt="Agendamentous" />
      <Image property={prefix} src="/images/close.webp" onClick={(e) => handleOnClickClear()} className="list_filter_container_clear_icon" alt="Agendamentous" />

    </Flex>


    <Flex property={prefix} className="list_ul_item header" id={"list_unidades_item_header"} key='-1'>
      <Text property={prefix} className="service item"> Serviço  </Text>
      <Text property={prefix} className="date item">  Data   </Text>
      <Text property={prefix} className="hour item"> Hora</Text>
      <Text property={prefix} className="cliente item"> Cliente </Text>
      <Text property={prefix} className="whatsapp item"> Whatsapp </Text>
      <Text property={prefix} className="value item"> Valor</Text>
      <Text property={prefix} className="time item"> Status</Text>
      <Text property={prefix} className="comments item"> Comentários   </Text>
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
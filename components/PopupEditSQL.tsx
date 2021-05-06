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


const prefix = "prefix_popup_sql"
const Popup: React.FC = () => {
  const toast = useToast()
  const router = useRouter()
  const API = configs.api


  function getClients() {
    return JSON.parse(localStorage.getItem('clientData'))
  }
  function getbarbeiros() {
    return JSON.parse(localStorage.getItem('barberData'))
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

  function _openMenuBarbeiros() {
    $('[property="prefix_barbeiros"].sidebar').animate({ width: '65%' }, 400)
    $('[property="prefix_barbeiros"].list_filter_container').animate({ width: '35%' }, 400)
    $('[property="prefix_barbeiros"].list_ul').animate({ width: '35%' }, 400)
  }
  function parseDate(d) { //YYYY MM DD
    var day = d.toString()
    if (!day.includes("/") || day.length < 9) {
      return " "
    } else {
      return day[6] + day[7] + "/" + day[4] + day[5] + "/" + day[0] + day[1] + day[2] + day[3]
    }
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

    $('[property="prefix_barbeiros"].list_main>.sidebar>.header>.sideabar_name').html(item.name)
    $('.barber_whatsbutton').attr('data-phone', item.whatsapp)

    if (item.photo != null) {
      $('[property="prefix_barbeiros"].list_main>.sidebar>.header>.sideabar_photo').attr('src', './images/avatar/' + item.photo)
    }

    $('[property="prefix_barbeiros"].list_ul_item').removeClass('list_ul_item_selected')
    $('[property="prefix_barbeiros"]#list_unidades_item' + item.id).addClass('list_ul_item_selected')
    _openMenuBarbeiros()
    $('.no_barbeiros_main').fadeOut()
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

  function cpf(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.toString().length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var result = true;
    [9, 10].forEach(function (j) {
      var soma = 0, r;
      cpf.split(/(?=)/).splice(0, j).forEach(function (e, i) {
        soma += parseInt(e) * ((j + 2) - (i + 1));
      });
      r = soma % 11;
      r = (r < 2) ? 0 : 11 - r;
      if (r != cpf.substring(j, j + 1)) result = false;
    });
    return result;
  }
  function handleCancelEdit() {
    $('.shadow_of_editing').fadeOut(150)

  }
  function handleOkEdit() {
    $('.form_edit_barber>.footer>.save>div').fadeIn(150)

    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };


    var sqlValue = $('.form_edit_barber>input').val()
    var sqlCol = $('.form_edit_barber>input').attr('data')
    var dataReturn = $('.form_edit_barber>input').attr('data-return')
    var sqlTable = $('.form_edit_barber>input').attr('table')
    var sqlWhereId = $('.form_edit_barber>input').attr('where_id')

    if (sqlCol.toLowerCase() == "nasc" && sqlValue.includes("/") && sqlValue.length > 9) {
      sqlValue = sqlValue.split("/")[2] + sqlValue.split("/")[1] + sqlValue.split("/")[0]
    }

    if (sqlCol.toLowerCase() == 'cpf') {
      if (!cpf(sqlValue)) {
        toast({
          title: "OOps...",
          description: "CPF inválido!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
        return;
      }
    }

    var bodyJson = {
      set: {},
      where: {
        id: sqlWhereId
      }
    }

    bodyJson.set[sqlCol] = sqlValue

    $('.shadow_of_editing').fadeOut(150)
    axios.post(API + '/update/' + sqlTable, bodyJson, config)
      .then(function (response) {

        $('.shadow_of_editing').fadeOut(150)
        $('.form_edit_barber>.footer>.save>div').fadeOut(150)

        $(dataReturn).val(sqlValue)

        toast({
          title: "Yeah...",
          description: "Salvo com sucesso!",
          status: "success",
          duration: 4000,
          isClosable: true,
        })

        loadData()

      })
      .catch(function (error) {
        console.log(JSON.stringify(error))
        toast({
          title: "Oops!",
          description: error.error,
          status: "error",
          duration: 4000,
          isClosable: true,
        })
        $('.shadow_of_editing').fadeOut(150)
        $('.form_edit_barber>.footer>.save>div').fadeOut(150)
      });

  }

  var lastPhone = ""
  function handleOnFocusInputContainer(selector) {
    var type = $(selector).attr('data-type')
    if (type.toLowerCase() == "date") {
      $(selector).val(date_formator($(selector).val()))
    } else if (type.toLowerCase() == "phone") {
      if ($(selector).val().length < 14) {
        lastPhone = phone_formatador($(selector).val())
        $(selector).val(lastPhone)
      } else {
        $(selector).val(lastPhone)
      }
    }
  }

  function phone_formatador(str) {
    return str.replace(/^(\d{2})(\d{5})(\d{4})+$/, "($1)$2-$3");
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

  return (
    <Text className="shadow_of_editing">
      <Flex className="container">
        <Flex property={prefix} className="form_edit_barber">
          <Text className="input_selected" property={prefix}></Text>
          <Input property={prefix}
            onFocus={() => handleOnFocusInputContainer(".form_edit_barber>input")}
            onBlur={() => handleOnFocusInputContainer(".form_edit_barber>input")}
            onKeyDown={() => handleOnFocusInputContainer(".form_edit_barber>input")}
            onKeyPress={() => handleOnFocusInputContainer(".form_edit_barber>input")}
            onKeyUp={() => handleOnFocusInputContainer(".form_edit_barber>input")}
          ></Input>
          <Flex property={prefix} className="footer">
            <Button property={prefix} onClick={() => handleCancelEdit()} className="cancel">Cancelar</Button>
            <Button property={prefix} onClick={() => handleOkEdit()} className="save"> <Spinner size="xl" />Salvar</Button>
          </Flex>
        </Flex>
      </Flex>
    </Text>
  );
}


export default Popup;
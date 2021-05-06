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

const prefix = "prefix_estoques"

const ListEstoques: React.FC = () => {
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
      // 0..2 digits. Just add (0XX''
      r = r.replace(/^(\d*)/, "(0$1");
    }
    return r;
  }

  function cancelAddProduct() {
    closeSidebarAddProduto()
  }

  function saveButtonClick() {
    $('.button_save').find('.in_load').fadeIn()
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };

    var jsonData = {
      title: $('[property="prefix_estoques"].sidebar_new_product>.parent>.input_container>.form_disable_false[name="title"]').val(),
      description: $('[property="prefix_estoques"].sidebar_new_product>.parent>.input_container>.form_disable_false[name="description"]').val(),
      price: $('[property="prefix_estoques"].sidebar_new_product>.parent>.input_container>.form_disable_false[name="price"]').val(),
      photo: $('[property="prefix_estoques"].sidebar_new_product>.parent>.input_container>.form_disable_false[name="photo"]').val(),
      qtd: $('[property="prefix_estoques"].sidebar_new_product>.parent>.input_container>.form_disable_false[name="qtd"]').val(),
      um: $('#prefix_estoques_form_input6').val()
    }

    if (jsonData.title == undefined || jsonData.title == null) {
      toast({
        title: "Oops!",
        description: "O campo Titulo é obrigatório!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    }
    if (jsonData.description == undefined || jsonData.title == null) {
      toast({
        title: "Oops!",
        description: "O campo Descrição é obrigatório!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    }
    if (jsonData.price == undefined || jsonData.title == null) {
      toast({
        title: "Oops!",
        description: "O campo Valor é obrigatório!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    }
    if (jsonData.qtd == undefined || jsonData.title == null) {
      toast({
        title: "Oops!",
        description: "O campo Quantidade é obrigatório!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    }
    if (jsonData.um == undefined || jsonData.title == null) {
      toast({
        title: "Oops!",
        description: "O campo Unidade de Medida é obrigatório!",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    }

    console.log(jsonData)
    axios.post(API + '/products', jsonData, config)
      .then(function (response) {
        $('.in_load').fadeOut()
        cancelAddProduct()
        loadProducts(1)
      })
      .catch(function (error) {
        console.log(error)
        $('.in_load').fadeOut()
        toast({
          title: "Oops!",
          description: "Falha interna!",
          status: "error",
          duration: 4000,
          isClosable: true,
        })
      });
  }

  function cancelButtonClick() {
    cancelAddProduct()
  }

  var form_mock = [
    { id: 1, className: 'id', placeholder: 'ID', type: 'text', disable: true, visible: false, value: "BR01293" },
    { id: 2, className: 'name', placeholder: 'Title', type: 'text', disable: false, visible: true, value: "", data: "title" },
    { id: 3, className: 'desc', placeholder: 'Descrição', type: 'text', disable: false, visible: true, value: "", data: "description" },
    { id: 4, className: 'photo', placeholder: 'Foto', type: 'photo', disable: false, visible: true, value: "", data: "photo" },
    { id: 5, className: 'qtd', placeholder: 'Quantidade', type: 'number', disable: false, visible: true, value: 1, data: "qtd" },
    {
      id: 6, className: 'um', placeholder: 'Unidade de Medida', type: 'combobox', disable: true, visible: true, value: "Item",
      combobox: ["PC", "POTE", "KG", "GRAMA", "LITRO", "KIT", "ITEM", "PEDAÇO", "PORÇÃO", "DIA", "MÊS", "ANO"], data: "um"
    },
    { id: 7, className: 'price', placeholder: 'Valor', type: 'money', disable: false, visible: true, value: 0, data: "price" },
    {
      id: 8, className: 'provider', placeholder: 'Fornecedor', type: 'combobox', disable: true, visible: false, value: "",
      combobox: ["REI DOS GELS ME", "LOREAL SOROCABA", "BARBA GROSSA REDE", "BOZZANO OFFICIAL"], data: "provider_id"
    },
    {
      id: 9, className: 'brand', placeholder: 'Marca', type: 'combobox', disable: true, visible: false, value: "",
      combobox: ["BOZZANO", "LOREAL", "REXONA", "BARBA LOKA", "NIKE"]
    }
  ]


  var productArray = [
    //  { id: 1, title: 'Gel de Cabelo', desc: 'Gel de cabelo body holp. o melhor do mercado!', photo: './images/gel.jpg', status: 'ATIVO', qtd: 30, um: 'unidade(s)', price: 12.90, provider: 'Global Gels', brand: 'Bozzano', date: 20211223 },
  ]

  function parseDateFormat(dateLong) {
    if (dateLong != undefined && dateLong != null && dateLong.indexOf("T") != -1) {
      var d = dateLong.split("T")[0]
      var newDay = d.split("-")[2]
      var newMonth = d.split("-")[1]
      var newYear = d.split("-")[0]
      return newDay + "/" + newMonth + "/" + newYear
    } else {
      return ""
    }
  }

  function loadProducts(filterId) {
    var config = {
      headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') }
    };
    var route = "/products"
    if (filterId != null && filterId != undefined) {
      route = "/products/" + filterId
    }

    axios.get(API + route, config)
      .then(function (response) {
        $('[property="prefix_estoques"].list_ul').html(" ")

        productArray = []
        productArray = response.data.data
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
            status = "ATIVO"
          } else {
            status = "INATIVO"
          }
          var stockCkass = ""
          var objStoqueBaixo = ""
          if (parseInt(e.qtd) < 5) {
            stockCkass = " stock_baixo "
            objStoqueBaixo = "<p class='stock_baixo'>Estoque baixo!</p>"
          }

          var unidadeDeMedida = e.um
          if (e.um.toString().trim().toLowerCase() == "undefined") {
            unidadeDeMedida = "Unidades"
          }

          if (e.qtd < 1) {
            status = "INATIVO"
            objStoqueBaixo = "<p class='stock_baixo'>Estoque zerado!</p>"
          }

          var row = `
<li property="prefix_estoques" class="list_ul_item `+ status + ` " id="list_unidades_item` + e.id + `">
<div property="prefix_estoques" class="col_1 ">`+ objStoqueBaixo + `
<img property="prefix_estoques" class="photo css-0" src="`+ e.photo + `"></div>
<div property="prefix_estoques" class="col_2 "><p property="prefix_estoques" class="id">ID: `+ e.id + `</p>
<div property="prefix_estoques" class="row_1 row ">
<p property="prefix_estoques" class="name item ">   `+ e.title + `   </p>
<p property="prefix_estoques" class="desc item "> `+ e.description + `   </p>
</div> <p property="prefix_estoques" class="status item `+ status.toLowerCase() + ` "> ` + status.toUpperCase() + `   </p>
<div property="prefix_estoques" class="row_3 row "><p property="prefix_estoques" class="qtd item "> QTD: `+ e.qtd + `   </p>
 </div>
<div property="prefix_estoques" class="row_4 row ">
<p property="prefix_estoques" class="price item hidden ">  `+ parseMoney(e.price) + `  </p></div></div></li>
`

          $('[property="prefix_estoques"].list_ul').append(row)
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
    var tempArray = productArray

    $('[property="' + prefix + '"].list_ul_item').removeClass('item_hide')

    tempArray.forEach(x => {
      if (x.title.toLowerCase().includes(texto) ||
        x.desc.toLowerCase().includes(texto) ||
        x.status.toLowerCase().includes(texto) ||
        x.provider.toString().toLowerCase().includes(texto) ||
        x.brand.toLowerCase().includes(texto)) {

      } else {
        ''
        $('[property="' + prefix + '"]#list_unidades_item' + x.id).addClass('item_hide')
      }
    })
  }

  function openCombobox(id) {
    $('.list_combobox').fadeOut(200)
    $("#" + id).fadeIn(200)
  }

  function selectItemInCombobox(id, value, index) {
    $('.list_combobox').fadeOut(200)
    $("#" + id).val(value)
    $('#' + prefix + '_form_input' + index).parent().find('p').addClass('input_selected')
  }

  function openSidebarAddProduto() {
    $('[property="' + prefix + '"].sidebar_new_product').animate({
      right: '0%'
    }, 230)

    $('.__shadow').fadeIn()

    $('[property="' + prefix + '"].list_main').find('.list_header').addClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.filters_containers').addClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.list_filter_container').addClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.list_ul').addClass('sidebar_open')
  }

  function closeSidebarAddProduto() {
    $('[property="' + prefix + '"].sidebar_new_product').animate({
      right: '-56%'
    }, 230)

    $('.__shadow').fadeOut()
    $('[property="' + prefix + '"].list_main').find('.list_header').removeClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.filters_containers').removeClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.list_filter_container').removeClass('sidebar_open')
    $('[property="' + prefix + '"].list_main').find('.list_ul').removeClass('sidebar_open')

  }

  function filter_select(className, filterId) {
    $('[property="' + prefix + '"].filters_containers>button').removeClass('selected')
    $('.' + className).addClass('selected')
    $('.' + className).find('.in_load').fadeIn()
    loadProducts(filterId)
  }

  function toggleLookMoney() {
    var open = $('[property="' + prefix + '"].footer>.look').hasClass('open')

    if (open) {
      $('[property="' + prefix + '"].footer>.look').removeClass('open')
      $('[property="' + prefix + '"].footer>.look').attr('src', './images/close_eye.webp')
      $('[property="' + prefix + '"].list_ul>li>.col_2>.row>.price').addClass('hidden')
    } else {
      $('[property="' + prefix + '"].footer>.look').addClass('open')
      $('[property="' + prefix + '"].footer>.look').attr('src', './images/open_eye.webp')
      $('[property="' + prefix + '"].list_ul>li>.col_2>.row>.price').removeClass('hidden')
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

  var lastPhone = ""
  function handleOnFocusInputContainer(id, type) {

    $('.list_combobox').fadeOut(200)

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
    } else if (type.toLowerCase() == "money" || type.toLowerCase() == "number") {
      $("#" + id).val($("#" + id).val().replace("R$", "").trim().replace(/[^,\d]/g, ''))
    }
  }

  function handleOnFocusOutInputContainer(id, type) {
    if ($("#" + id).val() != undefined && $("#" + id).val().trim().length == 0) {
      $("#" + id).parent().find('p').removeClass('input_selected')
    } else {
      $("#" + id).parent().find('p').removeClass('input_selected_color')
    }
  }

  function phone_formatador(str) {
    return str.replace(/^(\d{2})(\d{5})(\d{4})+$/, "($1)$2-$3");
  }

  return (<Flex className="list_main" property={prefix}>
    <Flex property={prefix} className="list_header">
      <Button property={prefix} className="button_new" onClick={() => openSidebarAddProduto()} > <Image property={prefix} src="/images/add_white.webp" alt="Barberus" />novo produto</Button>
      <Text className="list_header_title" property={prefix}>
        <Image property={prefix} src="/images/close.webp" onClick={() => handleClose()} className="list_header_close" alt="Barberus" />
        <Text property={prefix} className="push_form_body_button_title">Estoques</Text>
      </Text>
    </Flex>
    <Flex property={prefix} className="filters_containers" >

      <Button onClick={(e) => filter_select('todos', 1)} className="item todos selected">
        <Spinner className="in_load" size="xl" />  Todos
      </Button>
      <Button onClick={(e) => filter_select('ativos', 2)} className="item ativos">
        <Spinner className="in_load" size="xl" />  Ativos
      </Button>
      <Button onClick={(e) => filter_select('inativos', 3)} className="item inativos">
        <Spinner className="in_load" size="xl" />  Inativos
      </Button>
      <Button onClick={(e) => filter_select('estoque_baixo', 4)} className="item estoque_baixo">
        <Spinner className="in_load" size="xl" />  Estoque baixo
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
    <List property={prefix} className="list_ul" spacing={3}>
      {

        productArray.map((e, i) =>
          <ListItem property={prefix} onClick={() => handleListItemClick(e)}
            className={"list_ul_item " + e.status.toLowerCase()} id={"list_unidades_item" + e.id} key={i}>

            <Flex property={prefix} className="col_1">
              <Image property={prefix} src={e.photo} className="photo" />
            </Flex>
            <Flex property={prefix} className="col_2">
              <Text color="silver" fontSize="13px" fontWeight="600" property={prefix} className="id" >
                {"ID: " + e.id}
              </Text>

              <Flex property={prefix} className="row_1 row">
                <Text property={prefix} className="name item">   {e.title}   </Text>
                <Text property={prefix} className="desc item"> {e.desc}   </Text>
              </Flex>

              <Flex property={prefix} className="row_2 row">
                <Text property={prefix} className="provider item"> {(e.provider)}   </Text>
                <Text property={prefix} className="brand item"> {(e.brand)}   </Text>
                <Text property={prefix} className="date item"> {parseDate(e.date)}   </Text>
              </Flex>

              <Text property={prefix} className={"status item " + e.status.toLowerCase()}> {e.status}   </Text>
              <Flex property={prefix} className="row_3 row">
                <Text property={prefix} className="qtd item"> {e.qtd}   </Text>
                <Text property={prefix} className="um item"> {(e.um)}   </Text>
              </Flex>

              <Flex property={prefix} className="row_4 row">
                <Text property={prefix} className="price item hidden"> {parseMoney(e.price)}   </Text>
              </Flex>


            </Flex>

          </ListItem>)
      }
    </List>

    {Parser('<div class="__shadow "></div>')}

    <Flex className="sidebar_new_product" property={prefix}>

      <Flex position="absolute" top="0px" left="0px" className="box_default_top" width="100%">
        <Image onClick={() => cancelAddProduct()} src="/images/close.webp" className="box_default_top_close" alt="Barberus" />
        <Text className="box_default_top_title">
          <Image src="/images/caixa_2.png" className=" box_default_top_logo" alt="Barberus" />  NOVO PRODUTO
            </Text>
      </Flex>

      {
        form_mock.map((e, i) =>
          <Flex property={prefix} className={"parent"} >
            {e.type == 'combobox' && e.visible ?
              <Flex>
                <List id={"list_combobox_" + e.id} property={prefix} className={"list_combobox is_" + e.type}>
                  {
                    e.combobox.map((item, index) =>
                      <ListItem onClick={() => selectItemInCombobox(prefix + "_form_input" + e.id, item, e.id)} property={prefix} className="list_combobox_item">{item}</ListItem>
                    )}
                </List>
                <Button id={"button_combobox_" + e.id} onClick={() => openCombobox("list_combobox_" + e.id)} property={prefix} className={"button_" + e.type + " "}>
                  <Image src="/images/add_white.webp" />
                </Button>
              </Flex>
              : null}
            <Flex className={"input_container visible_" + e.visible} width="100%" property={prefix}>
              <Text property={prefix}>{e.placeholder}</Text>
              <Input name={e.data} type={e.type} {..."disable=" + e.disable} property={prefix} className={"form_disable_" + e.disable + " " + e.className}
                onFocus={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                onBlur={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                onMouseLeave={() => handleOnFocusOutInputContainer(prefix + "_form_input" + e.id, e.type)}
                onKeyDown={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                onKeyPress={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                onKeyUp={() => handleOnFocusInputContainer(prefix + "_form_input" + e.id, e.type)}
                id={prefix + "_form_input" + e.id} placeholder={e.placeholder} />
            </Flex>
          </Flex>
        )
      }
      <Flex property={prefix} className="sidebar_footer">
        <Button property={prefix} onClick={(e) => cancelButtonClick()} className="button_footer button_cancel">
          Cancelar
      </Button>
        <Button property={prefix} onClick={(e) => saveButtonClick()} className="button_footer button_save">
          <Spinner className="in_load" size="xl" />    Adicionar
      </Button>
      </Flex>
    </Flex>

  </Flex >
  );
}


export default ListEstoques;
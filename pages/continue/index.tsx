import { useState, FormEvent } from 'react';
import { Flex, Image, Button, Text, useToast, Spinner } from '@chakra-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Router, useRouter } from 'next/router'
import $ from 'jquery';
//import Input from '../../../components/Input'
import Input from '../../components/Input'
import axios from 'axios';
var LocalStore = require('localstorejs');
var config = require('../config.json');


export default function Home() {

  const API = config.api
  const router = useRouter()
  const toast = useToast()
  const [password, setPassword] = useState('');

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function handlerSubmitCreate(event: FormEvent) {
    event.preventDefault();
    let email = router.query.email
    if (!validateEmail(email)) {
      toast({
        title: "Oops!",
        description: email + " não é um email válido!",
        status: "error",
        duration: 8000,
        isClosable: true,
      })
    } else {
      $('.button_login').text("")
      $('.loader').attr('style', 'display:block !important;')

      axios.post(API + '/login', { email: email, password: password },
        { headers: { 'Content-Type': 'application/json' } })
        .then(function (response) {
          toast({
            title: "Uuhul!",
            description: "Bem vindo, " + email,
            status: "success",
            duration: 8000,
            isClosable: true,
          })

          localStorage.setItem('token', response.data.token)
          router.push('/app')
          $('.button_login').text("CRIAR")
          $('.loader').attr('style', 'display:none !important;')
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

          $('.button_login').text("CRIAR")
          $('.loader').attr('style', 'display:none !important;')
        });
    }
  }

  return (
    <Flex
      as="main"
      justifyContent="center"
      alignItems="center"
    >
      <Flex boxShadow="0 0 10px silver"
        as="form"
        onSubmit={handlerSubmitCreate}
        backgroundColor="purple.700"
        borderRadius="md"
        flexDir="column"
        alignItems="stretch"
        padding={8}
        marginTop={4}
        width="100%"
        maxW="400px"
        position="absolute"
        paddingTop="160px"
        top="200px"
      >

        <Image marginBottom={8} src="/images/logo.png" className="pictureLogo" alt="Barberus" />
        <Text marginBottom={8} className="pictureBgLogo" />

        <Text textAlign="center" className="textTitle" fontSize="22px" color="purple.400" marginBottom={2}>
          Senha
        </Text>
        <Text textAlign="center" fontSize="16px" color="#5a5a5acc" marginBottom={2}>
          Digite sua senha para entrar
        </Text>
        <Input className="input_login"
          placeholder="Senha"
          backgroundColor="#FFFFFF"
          type="password"
          color="purple.600"
          marginTop={2}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />


        <Button id="form_enter" className="button_login"
          type="submit"
          backgroundColor="#141414"
          height="40px"
          width="100px"
          color="#FFFFFF"
          fontSize="11px"
          borderRadius="sm"
          marginTop={6}
          _hover={{ backgroundColor: 'purple.600' }}
        >
          ENTRAR
        </Button>
        <Spinner marginLeft="275px" className="loader" />

        <Button id="lost_password" className="button_cadastro"
          type="submit"
          backgroundColor="#FFFFFF"
          height="40px"
          width="100px"
          color="purple.600"
          fontSize="11px"
          borderRadius="sm"
        >
          ESQUECI A SENHA
        </Button>

        <FontAwesomeIcon
          onClick={() => router.push('/login')} className="back_button" icon={faArrowLeft} />

      </Flex>
    </Flex>
  )
}

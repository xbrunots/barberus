import { useState, FormEvent } from 'react';
import { Flex, Image, Button, Text, useToast, Spinner } from '@chakra-ui/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import $ from 'jquery';


//import Input from '../../../components/Input'
import Input from '../../components/Input'
import axios from 'axios';

export default function Home() {
  const toast = useToast()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [c_password, setc_Password] = useState('');
  const [validEmail, setValidEmail] = useState('');
  const [validPassword, setValidPassword] = useState('');

  function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  const router = useRouter()

  function handlerSubmitCreate(event: FormEvent) {
    event.preventDefault();


    if (!validateEmail(email)) {
      toast({
        title: "Oops!",
        description: email + " não é um email válido!",
        status: "error",
        duration: 8000,
        isClosable: true,
      })
    } else if (password.length < 5 || c_password.length < 5) {
      toast({
        title: "Oops!",
        description: "As senhas dem ter no mínimo 5 letras!",
        status: "error",
        duration: 8000,
        isClosable: true,
      })

    } else if (password != c_password) {
      toast({
        title: "Oops!",
        description: "As senhas são diferentes!",
        status: "error",
        duration: 8000,
        isClosable: true,
      })

    } else {
      $('#form_enter').text("")
      $('.loader').attr('style', 'display:block !important;')

      axios.post('/api/register', { email: email, password: password })
        .then(function (response) {
          if (response.data.success) {
            toast({
              title: "Uuhul!",
              description: "Usuário cadastrado com sucesso!",
              status: "success",
              duration: 8000,
              isClosable: true,
            })

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('email', email);

            router.push('/app')
          } else {
            toast({
              title: "Oops!",
              description: response.data.message,
              status: "error",
              duration: 8000,
              isClosable: true,
            })
          }
          $('#form_enter').text("CRIAR")
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

          $('#form_enter').text("CRIAR")
          $('.loader').attr('style', 'display:none !important;')
        });
    }
  }

  return (
    <Flex
      as="main"
      height="100vh"
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
        position="relative"
        paddingTop="160px"
      >

        <Image marginBottom={8} src="/images/logo.png" className="pictureLogo" alt="Barberus" />
        <Text marginBottom={8} className="pictureBgLogo" />

        <Text textAlign="center" className="textTitle" fontSize="22px" color="purple.400" marginBottom={2}>
          Cadastro de Usuário
        </Text>
        <Text textAlign="center" fontSize="16px" color="#5a5a5acc" marginBottom={2}>
          Preencha todos os campos!
        </Text>

        <Input name="email" className="input_login"
          placeholder="E-mail"
          backgroundColor="#FFFFFF"
          color="purple.600"
          marginTop={2}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <Input name="password" className="input_login"
          placeholder="Senha"
          backgroundColor="#FFFFFF"
          type="password"
          color="purple.600"
          marginTop={2}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Input name="confirm_password" className="input_login"
          placeholder="Senha"
          backgroundColor="#FFFFFF"
          type="password"
          color="purple.600"
          marginTop={2}
          value={c_password}
          onChange={e => setc_Password(e.target.value)}
        />


        <Button id="form_enter" className="button_create"
          type="submit"
          backgroundColor="#141414"
          height="40px"
          width="100%"
          color="#FFFFFF"
          fontSize="11px"
          borderRadius="sm"
          marginTop={6}
          _hover={{ backgroundColor: 'purple.600' }}
        >

          CRIAR
        </Button>
        <Spinner className="loader" />

        <FontAwesomeIcon
          onClick={() => router.push('/login')} className="back_button" icon={faArrowLeft} />

      </Flex>
    </Flex>
  )
}

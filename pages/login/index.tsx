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
  const [email, setEmail] = useState('');
  const router = useRouter()

  function handleSignUpToNewsletter(event: FormEvent) {
    event.preventDefault();

    //axios.post('/api/subscribe', { email });
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
        onSubmit={handleSignUpToNewsletter}
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
          Indentificação
        </Text>
        <Text textAlign="center" fontSize="16px" color="#5a5a5acc" marginBottom={2}>
          Digite seu e-mail para continuar
        </Text>
        <Input className="input_login"
          placeholder="E-mail"
          backgroundColor="#FFFFFF"
          color="purple.600"
          marginTop={2}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />


        <Button className="button_login"
          type="submit"
          backgroundColor="#141414"
          height="40px"
          width="100px"
          color="#FFFFFF"
          fontSize="11px"
          borderRadius="sm"
          marginTop={6}
          _hover={{ backgroundColor: 'purple.600' }}
          onClick={() => router.push('/continue?email=' + email)}
        >
          PROXIMA
        </Button>
        <Spinner marginLeft="275px" className="loader" />

        <Button className="button_cadastro"
          type="submit"
          backgroundColor="#FFFFFF"
          height="40px"
          width="100px"
          color="purple.600"
          fontSize="11px"
          borderRadius="sm"
          onClick={() => router.push('/register')}
        >
          CRIAR CONTA
        </Button>
      </Flex>
    </Flex>
  )
}

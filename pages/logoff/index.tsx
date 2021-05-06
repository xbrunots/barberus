import { useState, FormEvent } from 'react';
import { Textarea, Select, Flex, Image, Button, Text, useToast, Spinner, List, ListItem, Avatar, AvatarBadge, Divider } from '@chakra-ui/core'
import OverflowWrapper from 'react-overflow-wrapper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTimes, faColumns } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import $ from 'jquery';
import jsCookie from 'js-cookie';
import Input from '../../components/Input'
import ListUnidades from '../../components/ListUnidades'
import ListBarbeiros from '../../components/BarbeirosComponent'
import Financeiro from '../../components/FinanceiroComponent'
import Estoques from '../../components/EstoqueComponent'
import Agendamentos from '../../components/AgendamentoComponenet'
import axios from 'axios';
var LocalStore = require('localstorejs');
import { useHistory } from "react-router-dom";
import Parser from 'html-react-parser';
var config = require('../config.json');
var dayjs = require('dayjs')


export default function Home({ _session }) {
    const [session, setSession] = useState(_session);
    const toast = useToast()
    const router = useRouter()
    const API = config.api

    function logoff() {
        $('.__initial_loading').removeClass('closeview')
        console.log('LOADED')
        var config = {
            headers: { 'Content-Type': 'application/json' }
        };

        axios.get(API + '/logoff', config)
            .then(function (response) {
                localStorage.removeItem('userData')
                localStorage.removeItem('token')
                router.push('/login')
            })
            .catch(function (error) {
                localStorage.removeItem('userData')
                localStorage.removeItem('token')
                router.push('/login')
            });
    }

    return (
        <Flex position="absolute"
            as="main"
            width="100%"
            justifyContent="center"
            top="40%"
            alignItems="center"
        >
            <Image className="foto_logoff" src="/images/logo.png">
            </Image>
            <Flex className="__initial_loading closeview">
                <Spinner size="xl" />
                <Text marginLeft="20px" fontSize="30px">Fechando barbearia...</Text>
            </Flex>

            <Text position="absolute" marginTop="-150px" marginLeft="20px" fontSize="30px">Efetuar logoff?</Text>
            <Button className="logoff_voltar" onClick={() => router.push('/app')}>
                Voltar para o Inicio
            </Button>
            <Button className="logoff_sair" onClick={() => logoff()}>
                Fechar barbearia?(logoff)
            </Button>
        </Flex>)
}

Home.getInitialProps = async ({ req }) => {
    return {}
}
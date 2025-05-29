document.addEventListener('DOMContentLoaded', () => {
    const validarEmail = (email) => {
        const expressaoRegular = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return expressaoRegular.test(String(email).toLowerCase());
    };

    const validarSenha = (senha) => {
        return senha.length >= 6;
    };

    const validarConfirmacaoSenha = (senha, confirmacaoSenha) => {
        return senha === confirmacaoSenha;
    };

    const validarNome = (nome) => {
        return nome.trim().length >= 3;
    };

    const exibirErro = (elemento, mensagem) => {
        const campo = elemento.parentElement;
        if (!campo) return;
        const erroExistente = campo.querySelector('.error-message');

        if (!erroExistente) {
            const divErro = document.createElement('div');
            divErro.className = 'error-message';
            divErro.style.color = 'red';
            divErro.style.fontSize = '0.875rem';
            divErro.style.marginTop = '0.25rem';
            divErro.textContent = mensagem;
            campo.appendChild(divErro);
        } else {
            erroExistente.textContent = mensagem;
        }
        elemento.style.borderColor = 'red';
    };

    const limparErro = (elemento) => {
        const campo = elemento.parentElement;
        if (!campo) return;
        const erroExistente = campo.querySelector('.error-message');
        if (erroExistente) {
            erroExistente.remove();
        }
        elemento.style.borderColor = '';
    };

    const campoCepGlobal = document.getElementById('CEP');
    const campoEnderecoGlobal = document.getElementById('endereco');
    const campoEstadoGlobal = document.getElementById('estado');

    const preencherCamposEnderecoComCep = (dadosCep) => {
        if (dadosCep.erro) {
            exibirErro(campoCepGlobal, 'CEP não encontrado.');
            if (campoEnderecoGlobal) campoEnderecoGlobal.value = '';
            if (campoEstadoGlobal) campoEstadoGlobal.value = '';
            return false;
        }

        let partesEnderecoCompleto = [];
        if (dadosCep.logradouro) partesEnderecoCompleto.push(dadosCep.logradouro);
        if (dadosCep.bairro) partesEnderecoCompleto.push(dadosCep.bairro);
        if (dadosCep.localidade) partesEnderecoCompleto.push(dadosCep.localidade);
        if (campoEnderecoGlobal) campoEnderecoGlobal.value = partesEnderecoCompleto.join(', ');
        if (campoEstadoGlobal) campoEstadoGlobal.value = dadosCep.uf || '';

        limparErro(campoCepGlobal);
        if (campoEnderecoGlobal && campoEnderecoGlobal.value) limparErro(campoEnderecoGlobal);
        if (campoEstadoGlobal && campoEstadoGlobal.value) limparErro(campoEstadoGlobal);
        return true;
    };

    const buscarEnderecoPorCep = async () => {
        if (!campoCepGlobal) return;

        limparErro(campoCepGlobal);
        const valorCep = campoCepGlobal.value.replace(/\D/g, '');

        if (valorCep.length !== 8) {
            if (campoCepGlobal.value.trim() !== '') {
                exibirErro(campoCepGlobal, 'CEP deve conter 8 dígitos válidos.');
            }
            return;
        }

        campoCepGlobal.disabled = true;

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${valorCep}/json/`);
            if (!resposta.ok) {
                throw new Error(`Erro na rede (${resposta.status}) ao buscar CEP.`);
            }
            const dadosCep = await resposta.json();
            preencherCamposEnderecoComCep(dadosCep);
        } catch (erro) {
            exibirErro(campoCepGlobal, 'Falha ao buscar dados do CEP. Verifique a conexão.');
            if (campoEnderecoGlobal) campoEnderecoGlobal.value = '';
            if (campoEstadoGlobal) campoEstadoGlobal.value = '';
        } finally {
            campoCepGlobal.disabled = false;
        }
    };

    if (campoCepGlobal) {
        campoCepGlobal.addEventListener('blur', buscarEnderecoPorCep);
    }

    const formularioCadastro = document.getElementById('cadastroForm');
    if (formularioCadastro) {
        formularioCadastro.addEventListener('submit', (evento) => {
            evento.preventDefault();
            let ehValido = true;
            const campoNome = formularioCadastro.querySelector('#nome');
            const campoEmail = formularioCadastro.querySelector('#email');
            const campoCep = formularioCadastro.querySelector('#CEP');
            const campoEndereco = formularioCadastro.querySelector('#endereco');
            const campoEstado = formularioCadastro.querySelector('#estado');
            const campoSenha = formularioCadastro.querySelector('#senha');
            const campoConfirmarSenha = formularioCadastro.querySelector('#confirmarSenha');
            const campoTermos = formularioCadastro.querySelector('input[name="termos"]');

            [campoNome, campoEmail, campoCep, campoEndereco, campoEstado, campoSenha, campoConfirmarSenha].forEach(elemento => {
                if (elemento) limparErro(elemento);
            });

            if (campoNome && !validarNome(campoNome.value)) {
                exibirErro(campoNome, 'Nome deve ter pelo menos 3 caracteres');
                ehValido = false;
            }
            if (campoEmail && !validarEmail(campoEmail.value)) {
                exibirErro(campoEmail, 'Email inválido');
                ehValido = false;
            }

            const valorCepLimpo = campoCep.value.replace(/\D/g, '');
            if (valorCepLimpo.length !== 8) {
                exibirErro(campoCep, 'CEP deve conter 8 dígitos válidos.');
                ehValido = false;
            }

            if (campoEndereco.value.trim() === '') {
                exibirErro(campoEndereco, 'Endereço é obrigatório. Verifique o CEP ou preencha manualmente.');
                ehValido = false;
            }

            if (campoEstado.value.trim() === '') {
                exibirErro(campoEstado, 'Estado é obrigatório. Verifique o CEP ou preencha manualmente.');
                ehValido = false;
            } else if (campoEstado.value.trim().length !== 2 || !/^[A-Za-z]{2}$/.test(campoEstado.value.trim())) {
                exibirErro(campoEstado, 'UF do estado deve ter 2 letras.');
                ehValido = false;
            }

            if (campoSenha && !validarSenha(campoSenha.value)) {
                exibirErro(campoSenha, 'Senha deve ter pelo menos 6 caracteres');
                ehValido = false;
            }
            if (campoConfirmarSenha && !validarConfirmacaoSenha(campoSenha.value, campoConfirmarSenha.value)) {
                exibirErro(campoConfirmarSenha, 'As senhas não coincidem');
                ehValido = false;
            }
            if (campoTermos && !campoTermos.checked) {
                alert('Você precisa aceitar os termos de uso');
                ehValido = false;
            }

            if (ehValido) {
                const dadosUsuario = {
                    nome: campoNome.value,
                    email: campoEmail.value,
                    senha: campoSenha.value,
                    cep: campoCep.value,
                    endereco: campoEndereco.value,
                    estado: campoEstado.value,
                    termosAceitos: campoTermos ? campoTermos.checked : false,
                    dataCriacao: new Date().toISOString()
                };
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                if (usuarios.some(usuario => usuario.email === campoEmail.value)) {
                    exibirErro(campoEmail, 'Este email já está cadastrado');
                    return;
                }
                usuarios.push(dadosUsuario);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                alert('Cadastro realizado com sucesso! Por favor, faça o login.');
                window.location.href = 'login.html';
            }
        });
    }

    const formularioLogin = document.getElementById('loginForm');
    if (formularioLogin) {
        formularioLogin.addEventListener('submit', (evento) => {
            evento.preventDefault();
            let ehValido = true;
            const campoEmailLogin = formularioLogin.querySelector('#email');
            const campoSenhaLogin = formularioLogin.querySelector('#senha');
            const campoLembrarMe = formularioLogin.querySelector('input[name="lembrar"]');

            [campoEmailLogin, campoSenhaLogin].forEach(elemento => elemento && limparErro(elemento));

            if (campoEmailLogin && !validarEmail(campoEmailLogin.value)) {
                exibirErro(campoEmailLogin, 'Email inválido');
                ehValido = false;
            }
            if (campoSenhaLogin && campoSenhaLogin.value.length === 0) {
                exibirErro(campoSenhaLogin, 'Senha é obrigatória.');
                ehValido = false;
            }

            if (ehValido) {
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const usuarioEncontrado = usuarios.find(usr => usr.email === campoEmailLogin.value && usr.senha === campoSenhaLogin.value);

                if (usuarioEncontrado) {
                    localStorage.setItem('usuarioAtual', JSON.stringify(usuarioEncontrado));
                    if (campoLembrarMe && campoLembrarMe.checked) {
                        localStorage.setItem('emailLembrado', campoEmailLogin.value);
                    } else {
                        localStorage.removeItem('emailLembrado');
                    }
                    window.location.href = 'logout.html';
                } else {
                    const elementoFeedbackLogin = document.getElementById('login-feedback');
                    if (elementoFeedbackLogin) {
                        elementoFeedbackLogin.textContent = 'Email ou senha incorretos.';
                        elementoFeedbackLogin.style.color = 'red';
                        elementoFeedbackLogin.style.display = 'block';
                    } else {
                        alert('Email ou senha incorretos');
                    }
                }
            }
        });
        const emailLembrado = localStorage.getItem('emailLembrado');
        const campoEmailParaLogin = formularioLogin.querySelector('#email');
        if (emailLembrado && campoEmailParaLogin) {
            campoEmailParaLogin.value = emailLembrado;
            const checkboxLembrarMe = formularioLogin.querySelector('input[name="lembrar"]');
            if (checkboxLembrarMe) {
                checkboxLembrarMe.checked = true;
            }
        }
    }

    if (window.location.pathname.endsWith('logout.html')) {
        const botaoMenuPerfil = document.getElementById('botaoMenuPerfil');
        const dropdownMenuPerfil = document.getElementById('dropdownPerfilConteudo');
        const botaoSairDropdown = document.getElementById('botaoSairDropdown');
        const elementoNomeUsuario = document.getElementById('nomeUsuario');
        const containerListaPosts = document.querySelector('.lista-posts');

        const usuarioAtual = JSON.parse(localStorage.getItem('usuarioAtual'));

        if (usuarioAtual && elementoNomeUsuario) {
            elementoNomeUsuario.textContent = usuarioAtual.nome;
        } else if (!usuarioAtual) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'login.html';
            return;
        }

        if (botaoMenuPerfil && dropdownMenuPerfil) {
            botaoMenuPerfil.addEventListener('click', (evento) => {
                evento.stopPropagation();
                dropdownMenuPerfil.classList.toggle('ativo');
                botaoMenuPerfil.classList.toggle('aberto');
            });
            window.addEventListener('click', () => {
                if (dropdownMenuPerfil.classList.contains('ativo')) {
                    dropdownMenuPerfil.classList.remove('ativo');
                    botaoMenuPerfil.classList.remove('aberto');
                }
            });
            dropdownMenuPerfil.addEventListener('click', (evento) => {
                evento.stopPropagation();
            });
        }

        if (botaoSairDropdown) {
            botaoSairDropdown.addEventListener('click', (evento) => {
                evento.preventDefault();
                localStorage.removeItem('usuarioAtual');
                window.location.href = 'index.html';
            });
        }

        const linksAcaoPlaceholder = dropdownMenuPerfil.querySelectorAll('a[data-action]');
        linksAcaoPlaceholder.forEach(link => {
            link.addEventListener('click', function(evento) {
                evento.preventDefault();
                const acao = this.getAttribute('data-action');
                dropdownMenuPerfil.classList.remove('ativo');
                botaoMenuPerfil.classList.remove('aberto');
                if (acao === 'mostrar-form-nome') {
                    alert('Funcionalidade "Alterar Nome" ainda não implementada.');
                } else if (acao === 'mostrar-form-email') {
                    alert('Funcionalidade "Alterar Email" ainda não implementada.');
                } else if (acao === 'mostrar-form-senha') {
                    alert('Funcionalidade "Alterar Senha" ainda não implementada.');
                }
            });
        });

        const postsExemplo = [
            {
                id: 1,
                titulo: "Explorando Assets da Unity Store",
                autor: usuarioAtual.nome,
                data: "22/05/2024",
                urlImagem: "https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=600",
                conteudo: "Hoje dei uma olhada em alguns assets gratuitos na Unity Asset Store para prototipagem rápida. Encontrei pacotes de ambiente 3D e personagens low-poly muito úteis!",
                categorias: ["Unity", "Assets", "Prototipagem"]
            },
            {
                id: 2,
                titulo: "Desafios de Iluminação no Unreal Engine 5",
                autor: "Colega Desenvolvedor",
                data: "21/05/2024",
                urlImagem: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600",
                conteudo: "Lumen é incrível, mas configurar a iluminação para obter o efeito desejado e manter a performance pode ser um desafio. Compartilhando algumas dicas que aprendi.",
                categorias: ["UnrealEngine5", "Iluminação", "Lumen"]
            },
            {
                id: 3,
                titulo: "Primeiros Passos com Godot Engine",
                autor: "Aventureiro Indie",
                data: "20/05/2024",
                conteudo: "Decidi experimentar o Godot Engine para um pequeno projeto 2D. A linguagem GDScript é bem intuitiva e a interface do editor é amigável para iniciantes.",
                categorias: ["Godot", "2D", "Iniciante"]
            }
        ];

        function renderizarPosts(postsParaRenderizar) {
            if (!containerListaPosts) {
                console.error('Elemento .lista-posts não encontrado no HTML.');
                return;
            }
            containerListaPosts.innerHTML = '';

            if (!postsParaRenderizar || postsParaRenderizar.length === 0) {
                containerListaPosts.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--cor-texto-secundario);">Nenhum post para exibir no momento.</p>';
                return;
            }

            postsParaRenderizar.forEach(post => {
                const cartaoPost = document.createElement('div');
                cartaoPost.className = 'post-card';

                let htmlImagem = '';
                if (post.urlImagem) {
                    htmlImagem = `<img src="${post.urlImagem}" alt="Imagem do post ${post.titulo}">`;
                }

                let htmlCategorias = '';
                if (post.categorias && post.categorias.length > 0) {
                    htmlCategorias = post.categorias.map(cat => `<span class="tag-post">#${cat}</span>`).join(' ');
                }

                cartaoPost.innerHTML = `
                    ${htmlImagem}
                    <h4>${post.titulo}</h4>
                    <div class="post-info">
                        <span>Autor: ${post.autor}</span>
                        <span>Data: ${post.data}</span>
                    </div>
                    <p class="post-conteudo">${post.conteudo.substring(0, 200)}${post.conteudo.length > 200 ? '...' : ''}</p>
                    <div class="post-tags">
                        ${htmlCategorias}
                    </div>
                    <a href="#" class="botao-secundario post-ler-mais" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.4rem 0.8rem;">Ler Mais</a>
                `;
                containerListaPosts.appendChild(cartaoPost);
            });
        }

        if(containerListaPosts) {
            renderizarPosts(postsExemplo);
        }

        const botoesFiltro = document.querySelectorAll('.filtros .filtro');
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(btn => btn.classList.remove('ativo'));
                this.classList.add('ativo');

                const filtroSelecionado = this.textContent.trim().toLowerCase();

                if (filtroSelecionado === 'todos') {
                    renderizarPosts(postsExemplo);
                } else {
                    const postsFiltrados = postsExemplo.filter(post =>
                        (post.categorias && post.categorias.some(cat => cat.toLowerCase().includes(filtroSelecionado))) ||
                        (post.titulo && post.titulo.toLowerCase().includes(filtroSelecionado))
                    );
                    renderizarPosts(postsFiltrados);
                }
            });
        });
    }
});

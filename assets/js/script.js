document.addEventListener('DOMContentLoaded', () => {

    // Valida se o email está no formato correto
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Verifica se a senha tem no mínimo 6 caracteres
    const validatePassword = (password) => {
        return password.length >= 6;
    };

    // Verifica se as senhas digitadas são iguais
    const validateConfirmPassword = (password, confirmPassword) => {
        return password === confirmPassword;
    };

    // Verifica se o nome tem ao menos 3 caracteres
    const validateName = (name) => {
        return name.trim().length >= 3;
    };

    // Exibe mensagem de erro abaixo do campo
    const showError = (element, message) => {
        const field = element.parentElement;
        if (!field) return;
        const existingError = field.querySelector('.error-message');

        if (!existingError) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.color = 'red';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            errorDiv.textContent = message;
            field.appendChild(errorDiv);
        } else {
            existingError.textContent = message;
        }
        element.style.borderColor = 'red';
    };

    // Remove mensagem de erro e borda vermelha
    const clearError = (element) => {
        const field = element.parentElement;
        if (!field) return;
        const existingError = field.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        element.style.borderColor = '';
    };

    // Cadastro de usuário
    const registerForm = document.getElementById('cadastroForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const nameInput = registerForm.querySelector('#nome');
            const emailInput = registerForm.querySelector('#email');
            const passwordInput = registerForm.querySelector('#senha');
            const confirmPasswordInput = registerForm.querySelector('#confirmarSenha');
            const terms = registerForm.querySelector('input[name="termos"]');

            [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => el && clearError(el));

            if (nameInput && !validateName(nameInput.value)) {
                showError(nameInput, 'Nome deve ter pelo menos 3 caracteres');
                isValid = false;
            }
            if (emailInput && !validateEmail(emailInput.value)) {
                showError(emailInput, 'Email inválido');
                isValid = false;
            }
            if (passwordInput && !validatePassword(passwordInput.value)) {
                showError(passwordInput, 'Senha deve ter pelo menos 6 caracteres');
                isValid = false;
            }
            if (confirmPasswordInput && !validateConfirmPassword(passwordInput.value, confirmPasswordInput.value)) {
                showError(confirmPasswordInput, 'As senhas não coincidem');
                isValid = false;
            }
            if (terms && !terms.checked) {
                alert('Você precisa aceitar os termos de uso');
                isValid = false;
            }

            if (isValid) {
                const userData = {
                    name: nameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value,
                    createdAt: new Date().toISOString()
                };
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                if (users.some(user => user.email === emailInput.value)) {
                    showError(emailInput, 'Este email já está cadastrado');
                    return;
                }
                users.push(userData);
                localStorage.setItem('users', JSON.stringify(users));
                alert('Cadastro realizado com sucesso! Por favor, faça o login.');
                window.location.href = 'login.html';
            }
        });
    }

    // Login de usuário
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            const emailInput = loginForm.querySelector('#email');
            const passwordInput = loginForm.querySelector('#senha');
            const rememberMe = loginForm.querySelector('input[name="lembrar"]');

            [emailInput, passwordInput].forEach(el => el && clearError(el));

            if (emailInput && !validateEmail(emailInput.value)) {
                showError(emailInput, 'Email inválido');
                isValid = false;
            }
            if (passwordInput && passwordInput.value.length === 0) {
                showError(passwordInput, 'Senha é obrigatória.');
                isValid = false;
            }

            if (isValid) {
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                const user = users.find(u => u.email === emailInput.value && u.password === passwordInput.value);

                if (user) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    if (rememberMe && rememberMe.checked) {
                        localStorage.setItem('rememberedEmail', emailInput.value);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    window.location.href = 'logout.html';
                } else {
                    const loginFeedbackElement = document.getElementById('login-feedback');
                    if (loginFeedbackElement) {
                        loginFeedbackElement.textContent = 'Email ou senha incorretos.';
                        loginFeedbackElement.style.color = 'red';
                        loginFeedbackElement.style.display = 'block';
                    } else {
                        alert('Email ou senha incorretos');
                    }
                }
            }
        });
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        const emailFieldForLogin = loginForm.querySelector('#email');
        if (rememberedEmail && emailFieldForLogin) {
            emailFieldForLogin.value = rememberedEmail;
            const rememberMeCheckbox = loginForm.querySelector('input[name="lembrar"]');
            if (rememberMeCheckbox) {
                rememberMeCheckbox.checked = true;
            }
        }
    }

    // Lógica específica para a página logout.html 
    if (window.location.pathname.endsWith('logout.html')) {
        const botaoMenuPerfil = document.getElementById('botaoMenuPerfil');
        const dropdownPerfilConteudo = document.getElementById('dropdownPerfilConteudo');
        const botaoSairDropdown = document.getElementById('botaoSairDropdown');
        const nomeUsuarioElement = document.getElementById('nomeUsuario');
        const listaPostsContainer = document.querySelector('.lista-posts'); 

        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (currentUser && nomeUsuarioElement) {
            nomeUsuarioElement.textContent = currentUser.name;
        } else if (!currentUser) {
            alert('Você precisa estar logado para acessar esta página.');
            window.location.href = 'login.html';
            return;
        }

        if (botaoMenuPerfil && dropdownPerfilConteudo) {
            botaoMenuPerfil.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdownPerfilConteudo.classList.toggle('ativo');
                botaoMenuPerfil.classList.toggle('aberto');
            });
            window.addEventListener('click', () => {
                if (dropdownPerfilConteudo.classList.contains('ativo')) {
                    dropdownPerfilConteudo.classList.remove('ativo');
                    botaoMenuPerfil.classList.remove('aberto');
                }
            });
            dropdownPerfilConteudo.addEventListener('click', (event) => {
                event.stopPropagation();
            });
        }

        if (botaoSairDropdown) {
            botaoSairDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            });
        }

        const linksAcaoPlaceholder = dropdownPerfilConteudo.querySelectorAll('a[data-action]');
        linksAcaoPlaceholder.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const acao = this.getAttribute('data-action');
                dropdownPerfilConteudo.classList.remove('ativo');
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

        // --- INÍCIO: LÓGICA PARA EXIBIR POSTS ---
        const samplePosts = [
            {
                id: 1,
                titulo: "Explorando Assets da Unity Store",
                autor: currentUser.name, 
                data: "22/05/2024",
                imagemUrl: "https://images.pexels.com/photos/160107/pexels-photo-160107.jpeg?auto=compress&cs=tinysrgb&w=600",
                conteudo: "Hoje dei uma olhada em alguns assets gratuitos na Unity Asset Store para prototipagem rápida. Encontrei pacotes de ambiente 3D e personagens low-poly muito úteis!",
                tags: ["Unity", "Assets", "Prototipagem"]
            },
            {
                id: 2,
                titulo: "Desafios de Iluminação no Unreal Engine 5",
                autor: "Colega Desenvolvedor",
                data: "21/05/2024",
                imagemUrl: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=600",
                conteudo: "Lumen é incrível, mas configurar a iluminação para obter o efeito desejado e manter a performance pode ser um desafio. Compartilhando algumas dicas que aprendi.",
                tags: ["UnrealEngine5", "Iluminação", "Lumen"]
            },
            {
                id: 3,
                titulo: "Primeiros Passos com Godot Engine",
                autor: "Aventureiro Indie",
                data: "20/05/2024",
                // sem imagemUrl intencionalmente
                conteudo: "Decidi experimentar o Godot Engine para um pequeno projeto 2D. A linguagem GDScript é bem intuitiva e a interface do editor é amigável para iniciantes.",
                tags: ["Godot", "2D", "Iniciante"]
            }
        ];

        function renderPosts(postsParaRenderizar) {
            if (!listaPostsContainer) {
                console.error('Elemento .lista-posts não encontrado no HTML.');
                return;
            }
            listaPostsContainer.innerHTML = ''; 

            if (!postsParaRenderizar || postsParaRenderizar.length === 0) {
                listaPostsContainer.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--cor-texto-secundario);">Nenhum post para exibir no momento.</p>';
                return;
            }

            postsParaRenderizar.forEach(post => {
                const postCard = document.createElement('div');
                postCard.className = 'post-card'; 

                let imagemHTML = '';
                if (post.imagemUrl) {
                    imagemHTML = `<img src="${post.imagemUrl}" alt="Imagem do post ${post.titulo}">`;
                }

                let tagsHTML = '';
                if (post.tags && post.tags.length > 0) {
                    tagsHTML = post.tags.map(tag => `<span class="tag-post">#${tag}</span>`).join(' ');
                }

                postCard.innerHTML = `
                    ${imagemHTML}
                    <h4>${post.titulo}</h4>
                    <div class="post-info">
                        <span>Autor: ${post.autor}</span>
                        <span>Data: ${post.data}</span>
                    </div>
                    <p class="post-conteudo">${post.conteudo.substring(0, 200)}${post.conteudo.length > 200 ? '...' : ''}</p>
                    <div class="post-tags">
                        ${tagsHTML}
                    </div>
                    <a href="#" class="botao-secundario post-ler-mais" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.4rem 0.8rem;">Ler Mais</a>
                `;
                listaPostsContainer.appendChild(postCard);
            });
        }

        // Renderiza os posts iniciais
        if(listaPostsContainer) { 
            renderPosts(samplePosts);
        }

        // Lógica de Filtros (opcional, mas incluída como exemplo)
        const botoesFiltro = document.querySelectorAll('.filtros .filtro');
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function() {
                botoesFiltro.forEach(btn => btn.classList.remove('ativo'));
                this.classList.add('ativo');
                
                const filtroSelecionado = this.textContent.trim().toLowerCase();
                
                if (filtroSelecionado === 'todos') {
                    renderPosts(samplePosts);
                } else {
                    const postsFiltrados = samplePosts.filter(post => 
                        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(filtroSelecionado))) ||
                        (post.titulo && post.titulo.toLowerCase().includes(filtroSelecionado)) 
                    );
                    renderPosts(postsFiltrados);
                }
            });
        });
        // --- FIM: LÓGICA PARA EXIBIR POSTS ---
    }

    // O antigo botão de sair com ID 'botaoSair' no header da dashboard foi removido.
    // Portanto, o código abaixo não é mais necessário PARA A DASHBOARD.
    /*
    const botaoSairLegado = document.getElementById('botaoSair');
    if (botaoSairLegado && !window.location.pathname.endsWith('logout.html')) {
        botaoSairLegado.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    */
});

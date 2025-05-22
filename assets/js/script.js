// Envolve todo o código em DOMContentLoaded para garantir que o DOM esteja pronto
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
    // Garante que field não seja null antes de tentar querySelector
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
    // Garante que field não seja null
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

        // Seleciona os campos dentro do contexto do formulário para evitar conflitos se houver IDs duplicados na página
        const nameInput = registerForm.querySelector('#nome');
        const emailInput = registerForm.querySelector('#email');
        const passwordInput = registerForm.querySelector('#senha');
        const confirmPasswordInput = registerForm.querySelector('#confirmarSenha');
        const terms = registerForm.querySelector('input[name="termos"]');

        // Limpa erros anteriores
        [nameInput, emailInput, passwordInput, confirmPasswordInput].forEach(el => el && clearError(el));

        // Valida os campos
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
            // Não faz login automático, apenas cadastra.
            alert('Cadastro realizado com sucesso! Por favor, faça o login.');
            window.location.href = 'login.html'; // Redireciona para a página de login
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
        // Apenas verifica se a senha foi preenchida para o login
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
                window.location.href = 'logout.html'; // logout.html
            } else {
                // mostrar erro no formulário em vez de alert
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

    // Preenche o email lembrado automaticamente no formulário de login
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

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Proteção da página e exibição do nome do usuário
    if (currentUser && nomeUsuarioElement) {
        nomeUsuarioElement.textContent = currentUser.name;
    } else if (!currentUser) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = 'login.html';
        return; 
    }

    // Controle do dropdown de perfil
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

    // Ação do botão Sair dentro do dropdown
    if (botaoSairDropdown) {
        botaoSairDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            // localStorage.removeItem('rememberedEmail'); // Opcional
            window.location.href = 'index.html'; // Ou login.html
        });
    }

    // Lógica para os itens "Alterar Nome", "Alterar Email", "Alterar Senha" (agora são apenas placeholders)
    const linksAcaoPlaceholder = dropdownPerfilConteudo.querySelectorAll('a[data-action]');
    linksAcaoPlaceholder.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); 
            const acao = this.getAttribute('data-action');
            
            // Esconde o dropdown
            dropdownPerfilConteudo.classList.remove('ativo');
            botaoMenuPerfil.classList.remove('aberto');

            // Apenas exibe um log ou um alerta, já que não haverá formulários
            if (acao === 'mostrar-form-nome') {
                alert('Funcionalidade "Alterar Nome" ainda não implementada.');
                console.log('Ação: Alterar Nome (placeholder)');
            } else if (acao === 'mostrar-form-email') {
                alert('Funcionalidade "Alterar Email" ainda não implementada.');
                console.log('Ação: Alterar Email (placeholder)');
            } else if (acao === 'mostrar-form-senha') {
                alert('Funcionalidade "Alterar Senha" ainda não implementada.');
                console.log('Ação: Alterar Senha (placeholder)');
            }
        });
    });
}

    // O antigo botão de sair com ID 'botaoSair' no header da dashboard foi removido.
    // Portanto, o código abaixo não é mais necessário PARA A DASHBOARD.
    // Se você tiver um botão com id 'botaoSair' em OUTRAS páginas, ele ainda funcionará.
    /*
    const botaoSairLegado = document.getElementById('botaoSair');
    if (botaoSairLegado && !window.location.pathname.endsWith('logout.html')) { // Só executa se não for a dashboard
        botaoSairLegado.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    */
});

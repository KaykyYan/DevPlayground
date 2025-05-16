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

    const name = document.getElementById('nome');
    const email = document.getElementById('email');
    const password = document.getElementById('senha');
    const confirmPassword = document.getElementById('confirmarSenha');
    const terms = document.querySelector('input[name="termos"]');

    // Limpa erros anteriores
    [name, email, password, confirmPassword].forEach(clearError);

    // Valida os campos
    if (!validateName(name.value)) {
    showError(name, 'Nome deve ter pelo menos 3 caracteres');
    isValid = false;
    }

    if (!validateEmail(email.value)) {
    showError(email, 'Email inválido');
    isValid = false;
    }

    if (!validatePassword(password.value)) {
    showError(password, 'Senha deve ter pelo menos 6 caracteres');
    isValid = false;
    }

    if (!validateConfirmPassword(password.value, confirmPassword.value)) {
    showError(confirmPassword, 'As senhas não coincidem');
    isValid = false;
    }

    if (!terms.checked) {
    alert('Você precisa aceitar os termos de uso');
    isValid = false;
    }

    // Se tudo estiver válido
    if (isValid) {
    const userData = {
        name: name.value,
        email: email.value,
        password: password.value,
        createdAt: new Date().toISOString()
    };

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Verifica se o e-mail já está cadastrado
    if (users.some(user => user.email === email.value)) {
        showError(email, 'Este email já está cadastrado');
        return;
    }

    // Salva o novo usuário
    users.push(userData);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(userData));

    alert('Cadastro realizado com sucesso!');
    window.location.href = '/index.html';
    }
});
}

// Login de usuário
const loginForm = document.getElementById('loginForm');
if (loginForm) {
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const email = document.getElementById('email');
    const password = document.getElementById('senha');
    const rememberMe = document.querySelector('input[name="lembrar"]');

    // Limpa erros anteriores
    [email, password].forEach(clearError);

    // Valida os campos
    if (!validateEmail(email.value)) {
    showError(email, 'Email inválido');
    isValid = false;
    }

    if (!validatePassword(password.value)) {
    showError(password, 'Senha deve ter pelo menos 6 caracteres');
    isValid = false;
    }

    if (isValid) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email.value && u.password === password.value);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));

        if (rememberMe.checked) {
        localStorage.setItem('rememberedEmail', email.value);
        } else {
        localStorage.removeItem('rememberedEmail');
        }

        window.location.href = 'logout.html';
    } else {
        alert('Email ou senha incorretos');
    }
    }
});

// Preenche o email lembrado automaticamente
const rememberedEmail = localStorage.getItem('rememberedEmail');
if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.querySelector('input[name="lembrar"]').checked = true;
}
}  

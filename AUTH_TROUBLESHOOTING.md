# 🔐 Solução de Problemas - Autenticação Supabase

## 🚨 Problema: Login não está validando com o Authentication do Supabase

### ✅ **Soluções Implementadas**

1. **Componente de Autenticação Atualizado**

   - Integração real com o Supabase
   - Validação de campos
   - Tratamento de erros
   - Logs de debug

2. **Guards de Rota Implementados**

   - `AuthGuard`: Protege rotas que precisam de login
   - `NoAuthGuard`: Redireciona usuários logados para o dashboard

3. **Serviços Configurados**
   - `AuthService`: Gerencia estado de autenticação
   - `SupabaseService`: Comunicação direta com o Supabase

### 🔍 **Verificações Necessárias**

#### 1. **Configuração do Supabase Dashboard**

- [ ] **Tabelas criadas**: Execute o schema SQL em `src/supabase/schema.sql`
- [ ] **Autenticação habilitada**: Verifique se está ativa no Dashboard
- [ ] **Email confirmado**: Configure se precisa de confirmação de email

#### 2. **Configuração de Autenticação**

No Supabase Dashboard:

1. Vá para **Authentication** → **Settings**
2. Verifique se **Enable email confirmations** está configurado conforme necessário
3. Configure **Site URL** para `http://localhost:4200` (desenvolvimento)

#### 3. **Verificar Credenciais**

Confirme que as credenciais em `src/environments/environment.ts` estão corretas:

```typescript
supabase: {
  url: 'https://mmpsnydvhbardmioqztf.supabase.co',
  anonKey: 'sua_chave_aqui'
}
```

### 🧪 **Teste de Funcionamento**

#### 1. **Criar Usuário de Teste**

1. Acesse o Supabase Dashboard
2. Vá para **Authentication** → **Users**
3. Clique em **"Add user"**
4. Crie um usuário com email e senha válidos

#### 2. **Testar Login**

1. Execute a aplicação: `npm start`
2. Acesse `/auth`
3. Tente fazer login com o usuário criado
4. Verifique o console do navegador para logs de debug

#### 3. **Verificar Logs**

No console do navegador, você deve ver:

```
Tentando signin com: {email: "teste@email.com", passwordLength: 6}
Resultado do signIn: {success: true}
```

### 🚨 **Problemas Comuns e Soluções**

#### **Erro: "Invalid login credentials"**

**Causa**: Usuário não existe ou senha incorreta
**Solução**:

- Crie o usuário no Supabase Dashboard primeiro
- Verifique se a senha está correta

#### **Erro: "Email not confirmed"**

**Causa**: Confirmação de email obrigatória
**Solução**:

- Verifique o email e confirme a conta
- Ou desabilite a confirmação no Dashboard

#### **Erro: "Network error"**

**Causa**: Problema de conectividade ou credenciais
**Solução**:

- Verifique a conexão com a internet
- Confirme se as credenciais estão corretas
- Teste a URL do Supabase no navegador

#### **Erro: "Rate limit exceeded"**

**Causa**: Muitas tentativas de login
**Solução**:

- Aguarde alguns minutos
- Verifique se não há loop infinito no código

### 🔧 **Debug Avançado**

#### 1. **Verificar Conexão com Supabase**

No console do navegador:

```typescript
// Verificar se o cliente está configurado
console.log('Supabase URL:', environment.supabase.url);
console.log('Supabase Key:', environment.supabase.anonKey);
```

#### 2. **Testar Métodos do Supabase**

```typescript
// No console do navegador
const supabase = window.supabase; // Se disponível globalmente
// Ou injetar o serviço e testar
```

#### 3. **Verificar Políticas RLS**

No Supabase Dashboard:

1. Vá para **Authentication** → **Policies**
2. Verifique se as políticas estão ativas
3. Confirme se as permissões estão corretas

### 📱 **Teste no Navegador**

#### 1. **Abrir DevTools**

- F12 ou Ctrl+Shift+I
- Vá para a aba **Console**

#### 2. **Verificar Erros**

- Procure por erros em vermelho
- Verifique se há erros de CORS
- Confirme se as requisições estão sendo feitas

#### 3. **Verificar Network**

- Vá para a aba **Network**
- Tente fazer login
- Verifique se as requisições para o Supabase estão sendo feitas

### 🎯 **Próximos Passos**

1. **Execute o schema SQL** no Supabase Dashboard
2. **Crie um usuário de teste** no Dashboard
3. **Teste o login** com o usuário criado
4. **Verifique os logs** no console do navegador
5. **Confirme se as rotas** estão sendo protegidas corretamente

### 📞 **Se o Problema Persistir**

1. **Verifique o console** do navegador para erros específicos
2. **Confirme as credenciais** do Supabase
3. **Teste a conexão** com o Supabase diretamente
4. **Verifique se as tabelas** foram criadas corretamente
5. **Consulte a documentação** oficial do Supabase

### 🔗 **Links Úteis**

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Angular Authentication Guide](https://angular.io/guide/authentication)

---

**Status**: ✅ Autenticação implementada e configurada
**Próximo**: Testar com usuário real no Supabase Dashboard

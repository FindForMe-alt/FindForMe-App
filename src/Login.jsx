import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

const handleLogin = async () => {
const { error } = await supabase.auth.signInWithPassword({
email,
password
})
if (error) alert(error.message)
else alert('Logged in!')
}

const handleSignup = async () => {
const { error } = await supabase.auth.signUp({
email,
password
})
if (error) alert(error.message)
else alert('Account created!')
}

return (
<div style={{ padding: 20 }}>
<h2>Login / Sign Up</h2>

<input
placeholder="Email"
onChange={e => setEmail(e.target.value)}
/>

<input
placeholder="Password"
type="password"
onChange={e => setPassword(e.target.value)}
/>

<br /><br />

<button onClick={handleLogin}>Login</button>
<button onClick={handleSignup}>Sign Up</button>
</div>
)
}
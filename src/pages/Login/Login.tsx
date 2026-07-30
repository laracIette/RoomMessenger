import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from '../../supabaseClient'

const SIGN_IN = 0;
const SIGN_UP = 1;

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSignUp = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { username: username } }
        });
        if (error) {
            setMessage(error.message);
        }
        else {
            setMessage("Check your email for the login link!");
        }

        setLoading(false);
    }

    const handleSignIn = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setMessage(error.message);
        }
        else {
            navigate("/home");
        }

        setLoading(false);
    }

    const [activePage, setActivePage] = useState(SIGN_IN);

    return (
        <div>

            <h2>Login or Create Account</h2>

            <div>
                <div>
                    <button onClick={() => setActivePage(SIGN_IN)}>Sign in</button>
                    <button onClick={() => setActivePage(SIGN_UP)}>Sign up</button>
                </div>

                <div>
                    {activePage === SIGN_IN &&
                    <div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button disabled={loading}>Sign in</button>
                        </form>
                    </div>
                    }

                    {activePage === SIGN_UP &&
                    <div>
                        <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="username"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button disabled={loading}>Sign up</button>
                        </form>
                    </div>
                    }
                </div>
            </div>

            {message && <p>{message}</p>}
        </div>
    );
}

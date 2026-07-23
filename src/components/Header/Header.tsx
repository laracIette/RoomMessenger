import { Link, Outlet } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function Header() {
    return (
    <>
        <Link to="/">
            <button>Home</button>
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </Link>
        <main>
            <Outlet />
        </main>
    </>
    );
}

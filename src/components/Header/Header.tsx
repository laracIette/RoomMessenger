import { Link, Outlet } from "react-router-dom";
import { supabase } from "../../supabaseClient";

export default function Header() {
    return (
    <>
        <div className="header">
            <Link to="/">
                <button>Home</button>
            </Link>
            <button onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
        <main>
            <Outlet />
        </main>
    </>
    );
}

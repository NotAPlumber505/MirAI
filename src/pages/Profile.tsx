import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Profile(props) {
    const navigate = useNavigate();
    const supabase = props.supabase;
    useEffect(() => {
        if(!props.isLoggedIn){
        const kickIfnotLogged = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (!(data.session === null))
                navigate("/login")
        }
        kickIfnotLogged;

        //Implement solver if supabase is null
        }
        },[props.isLoggedIn])
    return (
        <div className="flex gap-10 pt-32 w-full justify-center items-center">
            <button className="w-32 bg-black border-4 border-white rounded-md" onClick={logout}>Logout</button>
        </div>
    )
    async function logout() {
        const { error } = await supabase.auth.signOut();
        if(error)
            console.log("Supabase error!" + error)
        else
            navigate("/")
    }

}
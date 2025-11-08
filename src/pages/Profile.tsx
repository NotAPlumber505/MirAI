import { useNavigate } from "react-router-dom"


export default function Profile(props) {
    const navigate = useNavigate();
    const supabase = props.supabase;
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
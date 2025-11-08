import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

export default function Login(props: any) {
    const supabase = props.supabase;
    const [userEmail,setUserEmail] = useState("");
    const [userPassword,setUserPassword] = useState("");

    const navigate = useNavigate();
    supabase.auth.onAuthStateChange((event : any) => {
        if(event === "SIGNED_IN") 
            navigate("/")
    })

    return (
        <>
        Placeholder login page
        <input value={userEmail} onChange={handleEmailInput}></input>
        <input value={userPassword} onChange={handlePasswordInput}></input>
        <button onChange={submitLogin}>Login</button>
        </>
    )

    function handleEmailInput(element: any) {
        setUserEmail(element.target.value);
    }
    function handlePasswordInput(element: any) {
        setUserPassword(element.target.value);
    }
    async function submitLogin() {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: userPassword,
        });
        if(error)
            console.log("Supabase Error:" + error);
    }
}
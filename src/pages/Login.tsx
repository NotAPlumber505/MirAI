import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

export default function Login(props:any) {
    const supabase = props.supabase;
    const [userEmail,setUserEmail] = useState("");
    const [userPassword,setUserPassword] = useState("");

    const navigate = useNavigate();
    supabase.auth.onAuthStateChange((event : any) => {
        if(event === "SIGNED_IN") 
            navigate("/")
    })

    return (
        <div className="flex flex-col bg-black justify-center items-center">
        Placeholder login page
        <input className="w-32 bg-white border-4 border-white rounded-md" value={userEmail} onChange={handleEmailInput}></input>
        <input className="w-32 bg-white border-4 border-white rounded-md" value={userPassword} onChange={handlePasswordInput}></input>

        <div className="flex flex-row gap-5">
            <button className="w-16 bg-white border-4 border-white rounded-md" onClick={submitLogin}>Login</button>
            <button className="w-16 bg-white border-4 border-white rounded-md" onClick={submitRegister}> Register </button>
        </div>
        
        </div>
    )

    function handleEmailInput(element: any) {
        setUserEmail(element.target.value);
    }
    function handlePasswordInput(element: any) {
        setUserPassword(element.target.value);
    }
    async function submitLogin() {``
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: userPassword,
        });
        if(error)
            console.log("Supabase Error:" + error);
    }
    async function submitRegister() {
        const { error } = await supabase.auth.signUp({
            email: userEmail,
            password: userPassword,
        });
        if(error)
            console.log("Supabase Error: " + error);
        else {
            await submitLogin();
            await insertIntoUserTable()
        }
    }

    async function insertIntoUserTable() {
        const { error } = await supabase.from("users").insert({ email:  userEmail});
        if (error){
            console.log("Supabase Error: " + error);
            return null
        }
    }

}
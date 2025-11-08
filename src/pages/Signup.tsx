import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

export default function Signup(props:any) {
    const supabase = props.supabase;
    const [userEmail,setUserEmail] = useState("");
    const [userPassword,setUserPassword] = useState("");

    const navigate = useNavigate();

    return (
        <>
        Placeholder Register page
        <input value={userEmail} onChange={handleEmailInput}></input>
        <input value={userPassword} onChange={handlePasswordInput}></input>
        <button onClick={submitRegister}> Register</button>
        </>
    )

    function handleEmailInput(element: any) {
        setUserEmail(element.target.value);
    }
    function handlePasswordInput(element: any) {
        setUserPassword(element.target.value);
    }
    async function submitRegister() {
        const { error } = await supabase.auth.signUp({
            email: userEmail,
            password: userPassword,
        });
        if(error)
            console.log("Supabase Error: " + error);
        else
            insertIntoUserTable();
    }

    async function insertIntoUserTable() {
        const { error } = await supabase.from("users").insert();
        if (error)
            console.log("Supabase Error: " + error);
        else
            navigate("/")
    }
}
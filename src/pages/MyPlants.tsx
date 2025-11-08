import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
export default function MyPlants(props) {
    const navigate = useNavigate();
    useEffect(() => {
            if(!props.isLoggedIn)
                navigate("/login")
        },[props.isLoggedIn])
    return (
        <></>
    );
}
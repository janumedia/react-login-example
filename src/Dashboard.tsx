import React, { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

export const Dashboard = () => {
    const {resultData} = useContext(AuthContext);
    return (
        <div>
            <h2>Dashboard</h2>
            {
                resultData?.username 
                ? (
                    <div>{resultData.firstName} {resultData.lastName} ({resultData.username})</div>
                )
                : ''
            }
        </div>
    )
}
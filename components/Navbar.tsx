"use client";

import React from 'react';
import { ConnectWallet } from "@thirdweb-dev/react";

const Navbar: React.FC = () => {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "10px 90px",
        }}>
            <h1>Linea Frog Dex</h1>
            <ConnectWallet/>
        </div>
    );
};

export default Navbar;
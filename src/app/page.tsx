"use client";

import { toEther, toWei, useAddress, useBalance, useContract, useContractRead, useContractWrite, useSDK, useTokenBalance, ConnectWallet } from "@thirdweb-dev/react";
import styles from "../../styles/Home.module.css";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import SwapInput from "../../components/SwapInput";

const Home: NextPage = () => {
  // Contracts for the DEX and the token
  const TOKEN_CONTRACT = "0x4c52422A868dD7e38E9c298363D578ce812cB164";
  const DEX_CONTRACT = "0xF171063F3c9D176850De4A1A4BA182FC55a896c4";

  // SDK instance
  const sdk = useSDK();

  // Get the address of the connected account
  const address = useAddress();
  // Get contract instance for the token and the DEX
  const { contract: tokenContract } = useContract(TOKEN_CONTRACT);
  const { contract: dexContract } = useContract(DEX_CONTRACT);
  // Get token symbol and balance
  const { data: symbol } = useContractRead(tokenContract, "symbol");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);
  // Get native balance and LP token balance
  const { data: nativeBalance } = useBalance();
  const { data: contractTokenBalance } = useTokenBalance(tokenContract, DEX_CONTRACT);

  // State for the contract balance and the values to swap
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [nativeValue, setNativeValue] = useState<string>("0");
  const [tokenValue, setTokenValue] = useState<string>("0");
  const [currentFrom, setCurrentFrom] = useState<string>("native");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutateAsync: swapNativeToken } = useContractWrite(
    dexContract,
    "swapEthTotoken"
  );
  const { mutateAsync: swapTokenToNative } = useContractWrite(
    dexContract,
    "swapTokenToEth"
  );
  const { mutateAsync: approveTokenSpending } = useContractWrite(
    tokenContract,
    "approve"
  );

  // Get the amount of tokens to get based on the value to swap
  const { data: amountToGet } = useContractRead(
    dexContract,
    "getAmountOfTokens",
    currentFrom === "native"
      ? [
          toWei(nativeValue as string || "0"),
          toWei(contractBalance as string || "0"),
          contractTokenBalance?.value,
        ]
      : [
        toWei(tokenValue as string || "0"),
        contractTokenBalance?.value,
        toWei(contractBalance as string || "0"),
      ]
  );

  // Fetch the contract balance
  const fetchContractBalance = async () => {
    try {
      const balance = await sdk?.getBalance(DEX_CONTRACT);
      setContractBalance(balance?.displayValue || "0");
    } catch (error) {
      console.error(error);
    }
  };

  // Execute the swap
  // This function will swap the token to native or the native to the token
  const executeSwap = async () => {
    setIsLoading(true);
    try {
      if(currentFrom === "native") {
        await swapNativeToken({
          overrides: {
            value: toWei(nativeValue as string || "0"),
          }
        });
        alert("Swap executed successfully");
      } else {
        await approveTokenSpending({
          args: [
            DEX_CONTRACT,
            toWei(tokenValue as string || "0"),
          ]
        });
        await swapTokenToNative({
          args: [
            toWei(tokenValue as string || "0")
          ]
        });
        alert("Swap executed successfully");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while trying to execute the swap");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the contract balance and update it every 10 seconds
  useEffect(() => {
    fetchContractBalance();
    const interval = setInterval(fetchContractBalance, 10000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Update the amount to get based on the value
  useEffect(() => {
    if(!amountToGet) return;
    if(currentFrom === "native") {
      setTokenValue(toEther(amountToGet));
    } else {
      setNativeValue(toEther(amountToGet));
    }
  }, [amountToGet]);

  const handleToggle = () => {
    // Swap the values of nativeValue and tokenValue
    const tempValue = nativeValue;
    setNativeValue(tokenValue);
    setTokenValue(tempValue);

    // Swap the currentFrom state
    setCurrentFrom(currentFrom === "native" ? "token" : "native");
  };

  // Function to get the correct token names
  const getTokenNames = () => {
    return currentFrom === "native" ? { from: "ETH", to: symbol } : { from: symbol, to: "ETH" };
  };

  const { from, to } = getTokenNames();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div style={{
          backgroundColor: "#111929",
          padding: "0.5rem",
          borderRadius: "36px",
          minWidth: "500px",
        }}>
          <div>
            <SwapInput
              current={currentFrom}
              type="native"
              max={nativeBalance?.displayValue}
              value={nativeValue}
              setValue={setNativeValue}
              tokenSymbol="ETH"
              tokenBalance={nativeBalance?.displayValue}
            />
            <button
              onClick={handleToggle}
              className={styles.toggleButton}
            >↓
            </button>
            <SwapInput
              current={currentFrom}
              type="token"
              max={tokenBalance?.displayValue}
              value={tokenValue}
              setValue={setTokenValue}
              tokenSymbol="PF"
              tokenBalance={tokenBalance?.displayValue}
            />
          </div>
          {address ? (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={executeSwap}
                disabled={isLoading}
                className={styles.swapButton}
              >
                {isLoading ? "Loading..." : "Swap"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <ConnectWallet />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
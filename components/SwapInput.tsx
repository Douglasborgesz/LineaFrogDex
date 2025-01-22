import React from "react";
import styles from "../styles/Home.module.css";

type Props = {
    type: "native" | "token";
    tokenSymbol?: string;
    tokenBalance?: string;
    current: string;
    setValue: (value: string) => void;
    max?: string;
    value: string;
};

export default function SwapInput({
    type,
    tokenSymbol,
    tokenBalance,
    setValue,
    value,
    current,
    max,
}: Props) {
    const truncate = (value: string) => {
        if (value === undefined) return;
        if (value.length > 5) {
            return value.slice(0, 5);
        }
        return value;
    };

    const handlePercentageClick = (percentage: number) => {
        if (!max) return;
        const maxValue = parseFloat(max);
        if (isNaN(maxValue) || maxValue <= 0) return;
        const amount = (maxValue * percentage).toFixed(18);
        setValue(amount);
    };

    return (
        <div className={styles.swapInputContainer}>
            <div className={styles.inputHeader}>
                <span>{type === "native" ? "Sell" : "Buy"}</span>
                <span className={styles.tokenSymbol}>{tokenSymbol}</span>
            </div>
            <input 
                type="number"
                placeholder={`Enter ${type === "native" ? "ETH" : "PF"} amount`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={current !== type} 
                className={styles.swapInput}
            />
            <div className={styles.balanceContainer}>
                <span>Balance: {truncate(tokenBalance as string)}</span>
                {current === type && (
                    <div className={styles.buttonGroup}>
                        <button
                            onClick={() => handlePercentageClick(0.25)}
                            className={styles.percentageButton}
                        >25%</button>
                        <button
                            onClick={() => handlePercentageClick(0.5)}
                            className={styles.percentageButton}
                        >50%</button>
                        <button
                            onClick={() => handlePercentageClick(0.75)}
                            className={styles.percentageButton}
                        >75%</button>
                        <button
                            onClick={() => setValue(max || "0")}
                            className={styles.maxButton}
                        >Max</button>
                    </div>
                )}
            </div>
        </div>
    );
}
"use client"

import { createContext, useContext, useState } from "react"

const MailContext = createContext()

export const MailProvider = ({ children }) => {
    // Emails / Inbox
    const [emails, setEmails] = useState([])
    const [loading, setLoading] = useState(true)

    // Gmail Accounts connected by user
    const [mailAccounts, setMailAccounts] = useState([])

    // Categories created by user
    const [categories, setCategories] = useState([])

    // Tasks (e.g., reminders, to-do, etc.)
    const [tasks, setTasks] = useState([])

    // Labels (e.g., Primary, Promotions, Custom)
    const [labels, setLabels] = useState([
        { name: "Primary", color: "bg-red-500" },
        { name: "Social", color: "bg-blue-500" },
        { name: "Promotions", color: "bg-green-500" },
        { name: "Updates", color: "bg-yellow-500" },
        { name: "Forums", color: "bg-purple-500" },
    ])

    // Example extra (for debugging/test)
    const [sample, setSample] = useState("hello")

    return (
        <MailContext.Provider
            value={{
                emails,
                setEmails,
                loading,
                setLoading,

                mailAccounts,
                setMailAccounts,

                categories,
                setCategories,

                tasks,
                setTasks,

                labels,
                setLabels,

                sample,
                setSample,
            }}
        >
            {children}
        </MailContext.Provider>
    )
}

export const useMail = () => useContext(MailContext)

import { createRef, useContext, useEffect } from 'react';
import { GlobalContext } from "../base/GlobalContext";
import { Link } from "react-router-dom";
import React from 'react';

export const Redirector = () => {
    const redirectRef = createRef()
    const { RedirectUrl, setRedirectUrl } = useContext(GlobalContext)
    const Redirect = () => {
        if (!RedirectUrl) return
        setTimeout(() => setRedirectUrl(""), 1)
        !!redirectRef.current && redirectRef.current.click()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(Redirect, [RedirectUrl])
    /* use component Link,link auto push current location to history, Redirect cann't back to current page */ 
    return <div style={{ display: "none" }}>
        <Link to={RedirectUrl} ref={redirectRef} />
    </div>
}
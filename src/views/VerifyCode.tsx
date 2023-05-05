/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "../assets/styles/2fa.css";
import Button from "../components/Button";
import FaHeader from "../utils/FaHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import { AxiosClient } from "../utils/AxiosClient";
import { hashPhone } from "../utils/phonHashing";

type FormValues = {
  sentCode: string;
};
type APIResponses = {
  status: number;
  message?: string;
  verificationStatus?: string | boolean;
  codeValidity?: string | boolean;
};

function VerifyCode() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(0);
  const [error, setError] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const phone = location.state?.phone_number || null;
  useEffect(() => {
    if (phone) {
      setPhoneNumber(phone as string);
    } else {
      if (localStorage.getItem("phnbr")) {
        setPhoneNumber(localStorage.getItem("phnbr") as string);
      } else {
        navigate("/two-fa-setup");
      }
    }
  }, [phone]);
  useEffect(() => {
    if (phone_number != "") {
      setLoading(true);
      toast.loading("Sending OTP to your phone");
      AxiosClient.get<APIResponses>(`/sendcode/${phone_number}`)
        .then((response) => {
          toast.remove();
          if (response.data.status == 200) {
            toast.success("Check Your Messages.");
            setLoading(false);
          }
        })
        .catch((error) => {
          toast.remove();
          if (isAxiosError(error)) {
            setError(`Network error: ${error.message}`);
            toast.error(error.message);
          } else {
            setError(`Something went wrong `);
          }
          setError("Refresh the page.");
        })
        .finally(() => setLoading(false));
    }
  }, [phone_number]);
  document.title = "Verify OTP";

  const verifyCode = (phone: string, otp: number | string) => {
    toast.loading("Sending your request...");
    setLoading(true);
    AxiosClient.get<APIResponses>(`/verify/${phone}/${otp}`)
      .then((response) => {
        toast.remove();
        setResponse(response.data.status);
        if (response.data.codeValidity == true) {
          toast.success("You're verified!", { duration: 4000 });
          setTimeout(() => {
            navigate("/seller-home");
          }, 3000);
        } else {
          toast.error("Invalid code!");
        }
      })
      .catch((error) => {
        toast.remove();
        if (isAxiosError(error)) {
          setError(`Axios error: ${error.message}`);
          toast.error(error.message);
        } else {
          setError(`Something went wrong: `);
        }
      })
      .finally(() => setLoading(false));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const onSubmit = handleSubmit((data) =>
    verifyCode(phone_number, data.sentCode)
  );
  const checkLength = { value: 6, message: "Code Should be 6 digits" };
  return (
    <div className="setupContainer">
      <FaHeader />
      <div className="body-text">
        <p>Enter 6-digit code sent on your phone</p>
      </div>
      <form onSubmit={onSubmit}>
        {phone_number && hashPhone(phone_number)}
        <input
          style={{
            borderColor: errors.sentCode?.type == "required" ? "red" : "",
            textAlign: "center",
          }}
          type="number"
          placeholder="XXXXXX"
          {...register("sentCode", {
            required: true,
            maxLength: checkLength,
            minLength: checkLength,
          })}
          autoComplete="off"
        />
        {response ? "" : ""}
        {error && <p className="error">{error}</p>}
        {errors?.sentCode && <p className="error">{errors.sentCode.message}</p>}
        <Button text="Verify" disabled={loading} type="submit" />
      </form>
      <Toaster />
    </div>
  );
}

export default VerifyCode;

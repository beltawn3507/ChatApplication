import React from "react";
import { useState } from "react";
import { useauthStore } from "../store/authstore.js";
import { Link } from "react-router-dom";
import  toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import AuthImagePattern from "../Component/AuthImagePattern.jsx";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { isSigningUp, signup } = useauthStore();

  const validateForm = () => {
    if (!formdata.name.trim()) return toast.error("Full Name is Required");
    if (!formdata.email.trim()) return toast.error("Email is Required");
    if (!formdata.password.trim()) return toast.error("Password is Required");
    if (formdata.password.length < 6)
      return toast.error("Password must be at least 6 characters long");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formdata.email)) {
      return toast.error("Email is not valid");
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();
    console.log(success);
    if (success === true) signup(formdata);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-6" >

            {/* name form */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User  className="size-5 text-base-content/40"   />
                </div>
                <input type="text"  
                  className={`input input-bordered w-full pl-10`}
                  placeholder="John Doe"
                  value={formdata.name}
                  onChange={(e)=>setFormdata({...formdata,name:e.target.value})}
                />
              </div>

            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Enter Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail  className="size-5 text-base-content/40"   />
                </div>
                <input type="email"  
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formdata.email}
                  onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
                />
              </div>

            </div>

            {/* password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formdata.password}
                  onChange={(e) => setFormdata({ ...formdata, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Create Account"
              )}
            </button>


          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
    </div>
  );
}

export default SignUp;

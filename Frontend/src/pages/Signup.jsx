import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod';
import z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { registerUser } from "../authSlice";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";

const signupSchema = z.object({
    firstName: z.string().min(3, "Name should contain atleast 3 character"),
    emailId: z.string().email("Invalid Email"),
    password: z.string().min(8, "Password sholud contain atleast 8 character")
})

function Signup(){
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error} = useSelector((state) => state.auth);

    const {register, handleSubmit, formState: {errors}, } = useForm({resolver: zodResolver(signupSchema)});

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if(isAuthenticated){
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = (data) => {
        dispatch(registerUser(data));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-96 bg-base-100 shadow-xl" >
                <div className="card-body" >
                    <h2 className="card-title justify-center text-3xl">Faiscode</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>  
                       <div className="form-control">
                        <label className="label mb-1">
                            <span className="label-text">First Name</span>
                        </label>
                        <input type="text" placeholder="Jhon" className={`input input-bordered ${errors.firstName && 'input-error'}`}
                        {...register('firstName')} /> 
                        {errors.firstName && (
                            <span className="text-error">{errors.firstName.message}</span>
                        )}
                       </div>

                       <div className="form-control mt-4">
                        <label className="label mb-1">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="jhon@example.com" className={`input input-bordered ${errors.emailId && 'input-error'}`}
                        {...register('emailId')} /> 
                        {errors.emailId && (
                            <span className="text-error">{errors.emailId.message}</span>
                        )}
                       </div>

                       <div className="form-control mt-4">
                        <label className="label mb-1">
                            <span className="label-text">Password</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}  
                                placeholder="••••••••" 
                                className={`input input-bordered w-full pr-10 ${errors.password ? 'input-error' : ''}`}
                                {...register('password')}
                                aria-invalid={errors.password ? "true" : "false"} 
                            /> 
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5.12 12 5.12c4.478 0 8.268 2.823 9.542 6.88C20.268 16.057 16.478 18.88 12 18.88c-4.477 0-8.268-2.823-9.542-6.88z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="text-error">{errors.password.message}</span>
                        )}
                       </div>

                       <div className="form-control mt-6 flex justify-center" >
                        <button
                            type="submit" 
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                       </div>
                    </form>
                    <div className="text-center mt-6">
                        <span className="text-sm">
                            Already have an account?{' '}
                            <NavLink to="/login" className='link link-primary'>
                                Login
                            </NavLink>
                        </span>
                    </div>
                </div>
            </div>
        </div>     
    );
}

export default Signup 
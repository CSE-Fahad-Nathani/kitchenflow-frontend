import {
    CheckCircle2,
    CircleAlert,
    CircleX,
    Info,
    X,
  } from "lucide-react";
  import { useToastStore } from "../store/toastStore";
  
  const config = {
    success: {
      icon: CheckCircle2,
      color: "text-green-600",
      border: "bg-green-500",
    },
    error: {
      icon: CircleX,
      color: "text-red-600",
      border: "bg-red-500",
    },
    warning: {
      icon: CircleAlert,
      color: "text-orange-500",
      border: "bg-orange-500",
    },
    info: {
      icon: Info,
      color: "text-blue-500",
      border: "bg-blue-500",
    },
  };
  
  const Toast = () => {
    const {
      visible,
      type,
      title,
      message,
      duration,
    } = useToastStore();
  
    if (!visible) return null;
  
    const current = config[type];
    const Icon = current.icon;
  
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-sm animate-toast">
  
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-xl shadow-2xl">
  
          <div
            className={`absolute left-0 top-0 h-full w-1 ${current.border}`}
          />
  
          <div className="flex items-start gap-3 p-4">
  
            <Icon
              size={24}
              className={`mt-0.5 ${current.color}`}
            />
  
            <div className="flex-1">
  
              <h3 className="font-semibold text-gray-900">
                {title}
              </h3>
  
              {message && (
                <p className="mt-1 text-sm text-gray-500">
                  {message}
                </p>
              )}
  
            </div>
  
            <button
              onClick={() =>
                useToastStore.setState({
                  visible: false,
                })
              }
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={18} />
            </button>
  
          </div>
  
          <div
            key={Date.now()}
            className={`h-1 ${current.border} animate-progress`}
            style={{
              animationDuration: `${duration}ms`,
            }}
          />
  
        </div>
  
      </div>
    );
  };
  
  export default Toast;
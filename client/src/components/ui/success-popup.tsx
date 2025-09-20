import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Users, Package, Edit, Trash2, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  action?: 'create' | 'update' | 'delete' | 'save';
  icon?: React.ReactNode;
  duration?: number;
}

const actionIcons = {
  create: <Plus className="w-5 h-5" />,
  update: <Edit className="w-5 h-5" />,
  delete: <Trash2 className="w-5 h-5" />,
  save: <Save className="w-5 h-5" />
};

const actionColors = {
  create: 'bg-green-500',
  update: 'bg-blue-500', 
  delete: 'bg-red-500',
  save: 'bg-purple-500'
};

export const SuccessPopup: React.FC<SuccessPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  action = 'save',
  icon,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setProgress(100);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev - (100 / (duration / 50));
        });
      }, 50);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 transition-all duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Popup */}
      <div className="fixed top-4 right-4 pointer-events-auto">
        <div 
          className={cn(
            "relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 ease-out transform",
            isVisible 
              ? "translate-x-0 translate-y-0 opacity-100 scale-100" 
              : "translate-x-full translate-y-[-20px] opacity-0 scale-95"
          )}
          style={{ minWidth: '320px', maxWidth: '400px' }}
        >
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 bg-gray-200">
            <div 
              className={cn("h-full transition-all duration-75 ease-linear", actionColors[action])}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-500",
                actionColors[action],
                "animate-pulse"
              )}>
                <div className="animate-bounce">
                  {icon || actionIcons[action]}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 animate-fade-in">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 animate-fade-in-delay">
                  {message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success checkmark animation */}
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4 animate-bounce" />
              <span className="text-sm font-medium">Changes saved successfully!</span>
            </div>
          </div>

          {/* Animated border */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 opacity-20 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

// Custom hook for easier usage
export const useSuccessPopup = () => {
  const [popupState, setPopupState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: 'create' | 'update' | 'delete' | 'save';
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: 'save'
  });

  const showSuccess = (
    title: string, 
    message: string, 
    action: 'create' | 'update' | 'delete' | 'save' = 'save'
  ) => {
    setPopupState({
      isOpen: true,
      title,
      message,
      action
    });
  };

  const closePopup = () => {
    setPopupState(prev => ({ ...prev, isOpen: false }));
  };

  return {
    popupState,
    showSuccess,
    closePopup
  };
};
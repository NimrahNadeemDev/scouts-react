import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardCard = ({ icon, title, number, color, bgColor, hoverColor, status }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/jobs-list?status=${status}`);
      }}
      className={`${bgColor} cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl p-0 transform hover:scale-105 transition-all duration-300 overflow-hidden relative`}
    >
      <div className="flex items-center h-40">
        <div className="relative flex items-center justify-center" style={{ width: "45%" }}>
          <div
            className="absolute w-36 h-36 bg-white rounded-full shadow-lg flex items-center justify-center"
            style={{ left: "1rem" }}
          >
            <div className="text-gray-700">{icon}</div>
          </div>
        </div>
        <div className="flex-1 pr-8 text-right">
          <h3 className="text-5xl font-bold text-white mb-2">{number}</h3>
          <p className="text-lg text-white font-medium opacity-95">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;

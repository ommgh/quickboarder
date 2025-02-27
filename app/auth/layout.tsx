const Authlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className=" h-full flex items-center justify-center bg-gradient-to-b">
      {children}
    </div>
  );
};

export default Authlayout;

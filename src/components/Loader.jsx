import { Spinner } from "./ui/Spinner";
export default function Loader() {
  return (
    <div className="flex justify-center items-center h-full">
      <Spinner className="h-8 w-8 text-blue-600" />
    </div>
  );
}
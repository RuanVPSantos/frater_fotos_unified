
import ObraRouter from "./obra/router";
import ObraImageRouter from "./obraimage/router";


const routes = [
    { router: ObraRouter, prefix: "/obra" },
    { router: ObraImageRouter, prefix: "/obraimage" },
];
        
export default routes;
    
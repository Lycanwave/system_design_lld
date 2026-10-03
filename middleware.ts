

interface Req {
    route: string
}
interface Res {
    send: ()=>{}
}

// const finalHandler = () :Handler => {
//     const handler =  new Handler(req)
// }

interface Handler {
    setNext(next: Handler) : void;
    invoke(req: Req, res: Res): void;
}

class MiddlewareHandler implements Handler{

    private next?: Handler | null
    private handler: (req: Req, res: Res, next: Handler) => {}

    constructor(handler: (req: Req, res: Res, next: Handler) => {}) {
        this.handler = handler
    }

    setNext(next: Handler) {
        this.next = next; 
    }

    invoke(req: Req, res: Res) {

        if(!this.next) {
            // final handler
            res.send();
            return ;
        }

        this.handler(req,res, this.next);
    }

}

interface RouterItem {
    method: 'all' | 'get' | 'put' | 'post',
    route: string,
    handler: Handler
}

class Router implements Handler {
    private next?: Handler | null
    private routes: RouterItem[];

    constructor() {
        this.routes = [];
    } 

    setNext(next: Handler) {
        this.next = next
        // this.router.push(routerItem);
    }

    invoke(req: Req, res: Res) {
        
        const route = this.routes.find(r => r.route == req.route);

        if(route) {
            route.handler.invoke(req, res);
        } else if(this.next) {
            this.next.invoke(req, res);
        } else {
            res.send();
        }
    }
}






class App {

    private globalList: Handler[];

    static start() {

    }

    // use can be used by
    // app.use(path: [all], [...routers])
    // app.use(handler)
    // app.use()
    static use(path: string, args: Router) {

    }

    static use(handler: Handler) {

    }



    static router() {
        return new Router()
    }
}

// const Auth = (req: Req, res: Req, next: Handler) => {
//         console.log("auth");
// }


// const handler1 = new Handler(Auth);
// const handler2 = new Handler(Auth);
// handler1.setNext(handler2)
// handler1.invoke()




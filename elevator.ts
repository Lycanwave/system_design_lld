enum Direction {
    NONE,
    UP,
    DOWN
};

enum ElevatorState {
    IDLE,
    MOVING_UP,
    MOVING_DOWN,
    DOOR_OPEN,
    OUT_OF_SERVICE
}

enum ReqType {
    PICK_UP,
    PICK_DOWN,
    DESTINATION
}


class ElevatorRequest {
    private floor: number
    private direction: Direction

    constructor(floor: number, direction: Direction) {
        this.floor = floor;
        this.direction = direction;
    }

    getfloor(): number {
        return this.floor
    }

    getDirection(): Direction {
        return this.direction
    }
}

class Door {

    open(): void {
        console.log("door open")
    }

    close(): void {
        console.log("door close")
    }
}

class Elevator {
    
    private currentFloor: number
    private direction: Direction
    private state: ElevatorState
    // private request: Set<Req>
    private readonly upRequests: Set<number> 
    private readonly downRequests: Set<number>

    private readonly door: Door

    constructor(private readonly id: number, initialFloor: number) {
        this.upRequests = new Set();
        this.downRequests = new Set();
        this.door = new Door();
        this.direction = Direction.NONE
        this.currentFloor = initialFloor
        this.state = ElevatorState.IDLE
    }

    getId(): number {
        return this.id;
    }

    getCurrentFloor(): number {
        this.currentFloor;
    }

    getDirection(): Direction {
        return this.direction
    }

    getState(): ElevatorState {
        return this.state;
    } 
    
    addRequest(request: ElevatorRequest): void {
        
        const floor = request.getfloor();

        if(floor == this.currentFloor) {
            // this.open
        }

        if (floor > this.currentFloor) {
            this.upRequests.add(floor);
        } else  {
            this.downRequests.add(floor);
        }

        if(this.state = ElevatorState.IDLE) {
            
            if(floor > this.currentFloor) {
                this.state = ElevatorState.MOVING_UP
                this.direction = Direction.UP
            } else {
                this.state = ElevatorState.MOVING_DOWN
                this.direction = Direction.DOWN
            }
        }
    }
}

interface ElevatorSchedulingStrategy {
    selectElevator(elevators: Elevator[], request: ElevatorRequest): Elevator | null
}

class NearbyElevatorStrategy implements ElevatorSchedulingStrategy {

    selectElevator(elevators: Elevator[], request: ElevatorRequest): Elevator | null {

        let selectedElevator: Elevator | null = null;
        let min_distance: number = Infinity

        for(const elevator of elevators) {

            if(elevator.getState() == ElevatorState.OUT_OF_SERVICE) {
                continue;
            }

            const distance = Math.abs(elevator.getCurrentFloor() - request.getfloor());

            if(distance < min_distance) {
                min_distance = distance;
                selectedElevator = elevator
            }



        }

        return selectedElevator
        
    }
}

class ElevatorController {
    private elevators: Elevator[]
    private strategy: ElevatorSchedulingStrategy

    ElevatorController(elevators: Elevator[], strategy: ElevatorSchedulingStrategy) {
        this.elevators = elevators;
        this.strategy = strategy;
    }

    requestElevator(floor: number, direction: Direction): void {

        let req: ElevatorRequest = new ElevatorRequest(floor, direction)

        const elevator = this.strategy.selectElevator(this.elevators, req);

        if (!elevator) {
            throw new Error("No elevator available");
        }

        elevator.addRequest(req);

        console.log(`Elevator ${elevator.getId()} assigned`);
       
    }


}

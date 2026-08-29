
interface VendingMachineState{
    insertCoin(vendingMachine: VendingMachine, amount: Number): VendingMachineState

    idle(vendingMachine: VendingMachine): VendingMachineState
    hasMoney(vendingMachine: VendingMachine): VendingMachineState
    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState
    dispense(vendingMachine: VendingMachine): VendingMachineState
    oos(vendingMachine: VendingMachine): VendingMachineState

}

class Idle implements VendingMachineState {

    idle(vendingMachine: VendingMachine): VendingMachineState {

        return new HasMoney
    }

    hasMoney(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState{
        throw new Error("invalid State")
    }

    dispense(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    oos(vendingMachine: VendingMachine): VendingMachineState {
         throw new Error("invalid State")
    }
}

class HasMoney implements VendingMachineState {

    idle(vendingMachine: VendingMachine): VendingMachineState {

        return new HasMoney
    }

    hasMoney(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState{
        throw new Error("invalid State")
    }
    
    dispense(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    oos(vendingMachine: VendingMachine): VendingMachineState {
         throw new Error("invalid State")
    }
}

class Selection implements VendingMachineState {

    idle(vendingMachine: VendingMachine): VendingMachineState {

        return new HasMoney
    }

    hasMoney(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState{
        throw new Error("invalid State")
    }
    
    dispense(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    oos(vendingMachine: VendingMachine): VendingMachineState {
         throw new Error("invalid State")
    }
}

class Dispense implements VendingMachineState {

    idle(vendingMachine: VendingMachine): VendingMachineState {

        return new HasMoney
    }

    hasMoney(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState{
        throw new Error("invalid State")
    }
    
    dispense(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    oos(vendingMachine: VendingMachine): VendingMachineState {
         throw new Error("invalid State")
    }
}

class OutOfStock implements VendingMachineState {

    idle(vendingMachine: VendingMachine): VendingMachineState {

        return new HasMoney
    }

    hasMoney(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    selection(vendingMachine: VendingMachine, qty: Number): VendingMachineState{
        throw new Error("invalid State")
    }
    
    dispense(vendingMachine: VendingMachine): VendingMachineState{
        throw new Error("invalid State")
    }

    oos(vendingMachine: VendingMachine): VendingMachineState {
         throw new Error("invalid State")
    }
}

class Slot{
    private id: number
    private product_id: number
    private quantity: number
    private price: number

    constructor(id: number, product_id: number) {
        this.id = id
        this.product_id = product_id
        this.quantity = 0;
        this.price = 0;
    }

    getId() {return this.id}
    getProductId() {return this.product_id}
    getQty() {return this.quantity}
    getPrice() {return this.price}

    setPrice(price: number) { this.price = price}
    setQty(qty: number) { this.quantity = qty}
}

class VendingMachine {

    private slots: Slot[]
    private state: VendingMachineState

    idle(){}
    hasMoney(){}
    selection(){}
    dispense(){}

}

// Design - Expense / Bill sharing app
// App Allows users to share an Expense

// Users will be able to organize expenses among multiple heads and share with multiple users.
// Users can create a group.
// Share an expense among the members of group.
// Send notification to on their share to be paid.
// Add bank details for transfer of amount.
// Track paid users.

// Use cases

// Users should be able to register.
// User creation is idempotent.
// Registered user should be able to create an expense.
// Expense has three states

// Created
// Pending
// Settled
// Initial state of the expense would be created.
// Registered user should be able to create expense group i.e. to be able to add users to expenses.
// Bifurcation is custom no need to implement equal sharing. Once the bifurcation is complete the expense state becomes pending.
// Provision to extend to provide user notification when someone adds them to the expense.
// Users should be able to add their contribution.
// Once the settlement is complete from all the users the expense should become "Settled".
// Any number of users should be able to create expenses at the same time.
// One user should be able to create more than one expense and share it with different set os users.
// Expense creator should be able to track their expenses and payments made by users.
// Users can settle expense in parts.

// The solution should be extendable.
// No need to persist data in database. Data can be stored in memory.

// Workflow

// User creates an expense
// Add other users
// Share it Move Expense state to pending
// Notify
// Users contribute
// Check if the bill is settled
// If so move the expense to settled

// Entity
// User , Group, Expense, ExpenceState

// Service
// UserService, GroupService

class IDGenerator{
    static  user_id: number = 1;
    static group_id: number = 1;
    static expense_id: number = 1

    static getUserId() {
        return IDGenerator.user_id++;
    }

    static getGroupId() {
        return IDGenerator.group_id++;
    }

    static getExpanseId() {
        return IDGenerator.expense_id++;
    }
}


class User {
    private name: string;
    private id: number
    private email: string

    constructor(id: number, name: string, email: string) {
        this.name = name;
        this.id = IDGenerator.getUserId();
        this.email = email
    }

    getId(): number {
        return this.id;
    }

    getName(): string {
        return this.name;
    }
}


class UserService {
    private users: Map<string, User> = new Map();

    // Idempotent using email as the unique key.
    createUser(name: string, email: string): User {
        const existingUser = this.users.get(email);

        if (existingUser) {
            return existingUser;
        }

        const user = new User(
            IDGenerator.getUserId(),
            name,
            email
        );

        this.users.set(email, user);

        return user;
    }

    getUser(userId: number): User {
        for (const user of this.users.values()) {
            if (user.getId() === userId) {
                return user;
            }
        }

        throw new Error("User not found");
    }
}

/* =========================
   EXPENSE SHARE
   ========================= */

class ExpenseShare {

    constructor(
        private readonly userId: number,
        private readonly owedAmount: number,
        private paidAmount: number = 0
    ) {
        if (owedAmount < 0) {
            throw new Error("Owed amount cannot be negative");
        }

    }


    getUserId(): number {
        return this.userId;
    }

    getOwedAmount(): number {
        return this.owedAmount;
    }

    getPaidAmount(): number {
        return this.paidAmount;
    }

    getRemainingAmount(): number{
        return this.owedAmount - this.paidAmount
    }

    addPayment(amount: number): void {
        
        if (amount <= 0) {
            throw new Error("Payment must be greater than zero");
        }

        if (this.paidAmount + amount > this.owedAmount) {
            throw new Error("Payment exceeds user's owed amount");
        }

        this.paidAmount += amount;
    }

    isSettled(): boolean {
        return this.paidAmount === this.owedAmount;
    }

}


/* =========================
   SPLIT STRATEGY
   ========================= */

interface ExpenseSplitStrategy {
    calculate(totalAmount: number, users: User[]): ExpenseShare[]
}

class EqualSplitStrategy implements ExpenseSplitStrategy {

    calculate(totalAmount: number, users: User[]): ExpenseShare[] {

        if (users.length === 0) {
            throw new Error("At least one user is required");
        }

        const shares = [];

        const amount = totalAmount / users.length;

        return users.map(user => new ExpenseShare(user.getId(), amount))

    }
}

class ExactAmountSplitStrategy implements ExpenseSplitStrategy {

    constructor(private readonly amounts: Map<number, number>) {}

    calculate(totalAmount: number, users: User[]) {

        const sumAmount = [...this.amounts.values()].reduce((total, amount) => total + amount, 0)

        if(sumAmount != totalAmount) {
            throw new Error(`Exact split must equal total amount. Expected ${totalAmount}, got ${sumAmount}`);
        }

        return users.map(user => {
            const amount = this.amounts.get(user.getId());

            if (amount === undefined) {
                throw new Error(`No amount specified for user ${user.getId()}`);
            }

            return new ExpenseShare(
                user.getId(),
                amount
            );
        })
    }
}

class PercentageSplitStrategy implements ExpenseSplitStrategy {

    constructor(private readonly percentages: Map<number, number>) {}

    calculate(totalAmount: number, users: User[]) {

        const totalPercentage: number = [...this.percentages.values()].reduce((total, percentage) => total + percentage, 0);

        if(totalPercentage != 100) {
            throw new Error("Percentages must add up to 100");
        }

        return users.map(user => {

            const percentage = this.percentages.get(user.getId());

            if(percentage == undefined) {
                throw new Error(`No percentage specified for user ${user.getId()}`);
            }

            const amount = (totalAmount * percentage) / 100;

            return new ExpenseShare(
                user.getId(),
                amount
            )
        })
    } 
}

/* =========================
   EXPENSE
   ========================= */

enum ExpenseType {
    EQUAL,
    EXACT_AMOUNT,
    PERCENTAGE
}

enum ExpenseState {
    CREATED,
    PENDING,
    SETTLED
}

class Expense {

    constructor(
        private readonly id: number,
        private readonly totalAmount: number,
        private readonly expenseType: ExpenseType,
        private readonly shares: ExpenseShare[],
        private state: ExpenseState = ExpenseState.CREATED

    ){

        if(totalAmount <= 0) {
            throw new Error("Expense amount must be greater than zero");
        }
    }

    getId(): number {
        return this.id
    }

    getTotalAmount(): number {
        return this.totalAmount
    }

    getState(): ExpenseState {
        return this.state;
    }

    getExpenseType(): ExpenseType {
        return this.expenseType;
    }

    getShares(): ExpenseShare[] {
        return [...this.shares]
    }

    submit(): void {

        if( this.state != ExpenseState.CREATED) {
            throw new Error("Only a CREATED expense can be moved to PENDING");
        }

        this.validateShares();

        this.state = ExpenseState.PENDING

    }

    addPayment(userId: number, amount: number) {

        if (this.state !== ExpenseState.PENDING) {
            throw new Error("Payment can only be made for a PENDING expense");
        }

        const share = this.shares.find(share => share.getUserId() === userId);

        if(!share) {
            throw new Error("User is not part of this expense");
        }

        share.addPayment(amount);

        if (this.isFullySettled()) {
            this.state = ExpenseState.SETTLED;
        }
    }

    getUserRemainingAmount(userId: number) {
        const share = this.shares.find(share => share.getUserId() === userId);
        if (!share) {
            throw new Error("User is not part of this expense");
        }

        return share.getRemainingAmount();
    }

    isFullySettled() {
        return this.shares.every(share => share.isSettled());
    }

    private validateShares(): void {
        const totalShares = this.shares.reduce((total, share) => total + share.getOwedAmount(),0)

        if (totalShares != this.totalAmount) {
            throw new Error(`Split does not match total amount. Expected ${this.totalAmount}, got ${totalShares}`);
        }
    }
}

class Group {

    private readonly users: Map<number,User>
    private readonly expenses: Map<number,Expense>

    // private users: User[]
    // private id: number
    // private expenses: Expense[]

    constructor(private readonly id: number,
        private readonly name: string) {
        this.users = new Map();
        this.expenses = new Map();
    }

    getId() {
        return this.id;
    }

    removeUser(user_id: number) {

         const user_exist = this.users.has(user_id)

        if(!user_exist) {
            throw new Error("User is not a member of this group");
        }

        this.users.delete(user_id);
       
    }

    addUser(user: User): void {

        const user_exist = this.users.has(user.getId())

        if(user_exist) {
            throw new Error("User is already a member of this group");
        }

        this.users.set(user.getId(), user);
    
    }

    hasUser(userId: number): boolean {
        return this.users.has(userId);
    }

    getUsers(): User[] {
        return [...this.users.values()];
    }

    addExpense(expense: Expense): void {
        this.expenses.set(expense.getId(), expense);
    }

    getExpense(expenseId: number): Expense {

        const expense = this.expenses.get(expenseId);

        if(!expense) {
            throw new Error("Invalid expense");
        }

        return expense
    }
    
}

/* =========================
   GROUP SERVICE
   ========================= */

class GroupService {
    private readonly groups: Map<number, Group> = new Map();

    constructor(){}

    createGroup(name: string, creator: User): Group {

        const group = new Group(IDGenerator.getGroupId(),name);

        group.addUser(creator);
        this.groups.set(group.getId(), group)

        return group;

    }

    addUser(group_id: number, user: User) {

        const group = this.groups.get(group_id);

        if(!group) {
            throw new Error("Group not found");
        }

        group.addUser(user)
    }

    removeUser(group_id: number, user_id: number) {
         const group = this.groups.get(group_id);

        if(!group) {
            throw new Error("Group not found");
        }

        group.removeUser(user_id)
    }

    getGroup(groupId: number): Group {
        const group = this.groups.get(groupId);

        if (!group) {
            throw new Error("Group not found");
        }

        return group;
    }

}


/* =========================
   NOTIFICATION
   ========================= */

interface INotification {

    notifyExpenseCreated( expense: Expense,users: User[]): void
    notifyPaymentReceived(expense: Expense,users: User, amount:number): void
    notifyExpenseSettled(expense: Expense,users: User[]): void
}


class ConsoleNotificationService implements INotification {

    notifyExpenseCreated(expense: Expense,users: User[]): void {
        for (const user of users) {
            console.log(`[NOTIFICATION] ${user.getName()} owes money for expense ${expense.getId()}`);
        }
    }

    notifyPaymentReceived(expense: Expense,user: User,amount: number): void {
        console.log(`[NOTIFICATION] ${user.getName()} paid ${amount} for expense ${expense.getId()}`);
    }

    notifyExpenseSettled(expense: Expense,users: User[]): void {
        console.log(`[NOTIFICATION] Expense ${expense.getId()} is fully settled`);
    }
}

/* =========================
   EXPENSE SERVICE
   ========================= */


class ExpenseService {
    constructor(private readonly notificationService: INotification) {}

    createExpense(group: Group, creator: User, totalAmount: number, expenseType: ExpenseType, splitStrategy: ExpenseSplitStrategy): Expense {

        if (!group.hasUser(creator.getId())) {
            throw new Error("Creator is not part of the group");
        }

        const expenseShares = splitStrategy.calculate(totalAmount,group.getUsers());

        const expense = new Expense(IDGenerator.getExpanseId(), totalAmount, expenseType, expenseShares);

        group.addExpense(expense)

        return expense;
    }

    submitExpense(group: Group, expense: Expense) {
        if (!group) {
            throw new Error("Creator is not part of the group");
        }

        expense.submit();

        this.notificationService.notifyExpenseCreated(expense, group.getUsers());
    }

    contribute(expense: Expense, user: User, amount: number) {
        
        expense.addPayment(user.getId(), amount);

        this.notificationService.notifyPaymentReceived(
            expense,
            user,
            amount
        );

    }
}


/* =========================
   DEMO
   ========================= */

const userService = new UserService();
const groupService = new GroupService();
const notificationService =
    new ConsoleNotificationService();

const expenseService =
    new ExpenseService(notificationService);

// Create users
const rohit = userService.createUser(
    "Rohit",
    "rohit@gmail.com"
);

const amit = userService.createUser(
    "Amit",
    "amit@gmail.com"
);

const rahul = userService.createUser(
    "Rahul",
    "rahul@gmail.com"
);

// Idempotent user creation
const sameRohit = userService.createUser(
    "Rohit",
    "rohit@gmail.com"
);

console.log(
    "Same user:",
    rohit.getId() === sameRohit.getId()
);

// Create group
const group = groupService.createGroup(
    "Goa Trip",
    rohit
);

groupService.addUser(
    group.getId(),
    amit
);

groupService.addUser(
    group.getId(),
    rahul
);

// Exact split:
// Rohit = 400
// Amit  = 300
// Rahul = 300
const exactAmounts = new Map<number, number>([
    [rohit.getId(), 400],
    [amit.getId(), 300],
    [rahul.getId(), 300]
]);

const expense = expenseService.createExpense(
    group,
    rohit,
    1000,
    ExpenseType.EXACT_AMOUNT,
    new ExactAmountSplitStrategy(exactAmounts)
);

console.log(
    "Initial state:",
    ExpenseState[expense.getState()]
);

// Move CREATED -> PENDING
expenseService.submitExpense(
    group,
    expense
);

console.log(
    "After submit:",
    ExpenseState[expense.getState()]
);

// Partial payment
expenseService.contribute(
    expense,
    rohit,
    200
);

console.log(
    "Rohit remaining:",
    expense.getUserRemainingAmount(rohit.getId())
);

// Remaining payment
expenseService.contribute(
    expense,
    rohit,
    200
);

expenseService.contribute(
    expense,
    amit,
    300
);

expenseService.contribute(
    expense,
    rahul,
    300
);

console.log(
    "Final state:",
    ExpenseState[expense.getState()]
);


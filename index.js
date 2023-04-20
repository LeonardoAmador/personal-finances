let transactions = [];

const createTransactionContainer = (id) => {
    const container = document.createElement('div');
    container.classList.add('transaction');
    container.id = `transaction-${id}`;

    return container;
}

const createTransactionTitle = (name) => {
    const title = document.createElement('span');
    title.classList.add('transaction-title');
    title.textContent = name

    return title;
}

const createTransactionAmount = (amount) => {
    const span = document.createElement('span');

    const formatter = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    }).format(amount);

    if (amount > 0) {
        span.textContent = `${formatter} C`;;
        span.classList.add('credit');
    } else {
        span.textContent = `${formatter} D`;
        span.classList.add('debit');
    }

    return span;
}

const createEditTransactionBtn = (transaction) => {
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.textContent = 'Edit';

    editBtn.addEventListener('click', () => {
        document.querySelector('#id').value = transaction.id;
        document.querySelector('#name').value = transaction.name;
        document.querySelector('#amount').value = transaction.amount;
    });

    return editBtn;
}

const createDeleteTransactionBtn = (id) => {
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = 'Delete';
    
    deleteBtn.addEventListener('click', async () => {
        await fetch(`http://localhost:3000/transactions/${id}`, { method: "DELETE" });

        deleteBtn.parentElement.remove();
        const indexToRemove = transactions.findIndex((t) => t.id === id);
        transactions.splice(indexToRemove, 1);
        updateBalance();
    });

    return deleteBtn;
}

const renderTransaction = (transaction) => {
    const container = createTransactionContainer(transaction.id);
    const title = createTransactionTitle(transaction.name);
    const amount = createTransactionAmount(transaction.amount);
    const editBtn = createEditTransactionBtn(transaction);
    const deleteBtn = createDeleteTransactionBtn(transaction.id);

    container.append(title, amount, editBtn, deleteBtn);
    document.querySelector('#transactions').appendChild(container);
}

const saveTransaction = async (ev) => {
    ev.preventDefault();

    const id = document.querySelector('#id').value;
    const name = document.querySelector('#name').value;
    const amount = Number(document.querySelector('#amount').value);

    if (id) {
        // edit transaction with this id
        const response = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, amount }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp => resp.json());

        const indexToRemove = transactions.findIndex((t) => t.id === id);
        transactions.splice(indexToRemove, 1, response);
        document.querySelector(`#transaction-${id}`).remove();
        renderTransaction(response);
    } else {
        // create new transaction with this id
        const response = await fetch('http://localhost:3000/transactions', {
            method: "POST",
            body: JSON.stringify({ name, amount }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json());
    
        transactions.push(response);
        renderTransaction(response);
    }

    ev.target.reset();
    updateBalance();
}

const fetchTransactions = async () => {
    return await fetch('http://localhost:3000/transactions').then(res => res.json());
}

const updateBalance = () => {
    const balanceSpan = document.querySelector('#balance');
    const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    const formatter = Intl.NumberFormat('pt-BR', {
        compactDisplay: 'long',
        currency: 'BRL',
        style: 'currency'
    });
    balanceSpan.textContent = formatter.format(balance);
}

const setup = async () => {
    const results = await fetchTransactions();
    transactions.push(...results);
    transactions.forEach(transaction => renderTransaction(transaction));
    updateBalance();
}

document.addEventListener('DOMContentLoaded', setup);
document.querySelector('form').addEventListener('submit', saveTransaction);
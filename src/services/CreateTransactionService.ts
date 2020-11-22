import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balence');
    }

    let transactionCategoty = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategoty) {
      transactionCategoty = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(transactionCategoty);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategoty,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

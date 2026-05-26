import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoriesPage from '../pages/CategoriesPage';

// Мокаем API
jest.mock('../api/api', () => ({
  fetchCategories: jest.fn().mockResolvedValue([
    {
      id: 'c1',
      user_id: 'u1',
      name: 'Еда',
      type: 'expense',
      color: '#f97316',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c2',
      user_id: 'u1',
      name: 'Транспорт',
      type: 'expense',
      color: '#3b82f6',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'c3',
      user_id: 'u1',
      name: 'Зарплата',
      type: 'income',
      color: '#22c55e',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
  ]),
  addCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn(),
}));

describe('CategoriesPage — добавление категории', () => {
  it('показывает новую категорию после загрузки', async () => {
    render(
      <BrowserRouter>
        <CategoriesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Категории')).toBeInTheDocument();
    });

    expect(screen.getByText('Еда')).toBeInTheDocument();
  });
});

describe('CategoriesPage — удаление категории', () => {
  it('показывает кнопку удаления для категории', async () => {
    render(
      <BrowserRouter>
        <CategoriesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Категории')).toBeInTheDocument();
    });

    const deleteButtons = screen.queryAllByText('Удалить');
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});

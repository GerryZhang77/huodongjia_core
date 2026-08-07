import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type {
  RegistrationFormField,
  RegistrationOptionQuotaRule,
} from '../../types';
import RegistrationFormBuilder from '.';

const initialFields: RegistrationFormField[] = [
  {
    key: 'gender',
    label: '性别',
    type: 'radio',
    required: false,
    preset: true,
    deletable: true,
    options: ['男', '女'],
  },
  {
    key: 'city',
    label: '城市',
    type: 'select',
    required: false,
    preset: false,
    options: ['北京', '上海'],
  },
];

function Harness() {
  const [fields, setFields] = useState(initialFields);
  const [quotaFieldKey, setQuotaFieldKey] = useState<string | null>(null);
  const [quotaRules, setQuotaRules] = useState<RegistrationOptionQuotaRule[]>([]);

  return (
    <RegistrationFormBuilder
      value={fields}
      onChange={setFields}
      quotaFieldKey={quotaFieldKey}
      quotaRules={quotaRules}
      onQuotaChange={(fieldKey, rules, nextFields) => {
        setQuotaFieldKey(fieldKey);
        setQuotaRules(rules);
        if (nextFields) setFields(nextFields);
      }}
    />
  );
}

describe('RegistrationFormBuilder option quotas', () => {
  it('allows only one quota-control field and makes it required', () => {
    render(<Harness />);

    fireEvent.click(screen.getByText('配置报名收集信息'));
    fireEvent.click(screen.getByText('性别'));
    fireEvent.click(screen.getByRole('switch', { name: '性别按选项限制名额' }));

    const genderRequired = screen.getByRole('switch', { name: '性别必须填写' });
    expect(genderRequired.getAttribute('aria-checked')).toBe('true');
    expect((genderRequired as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('男名额') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('女名额') as HTMLInputElement).value).toBe('');

    fireEvent.change(screen.getByLabelText('男名额'), { target: { value: '20' } });
    expect((screen.getByLabelText('男名额') as HTMLInputElement).value).toBe('20');

    fireEvent.click(screen.getByText('城市'));
    fireEvent.click(screen.getByRole('switch', { name: '城市按选项限制名额' }));

    expect(
      screen.getByRole('switch', { name: '城市按选项限制名额' }).getAttribute('aria-checked'),
    ).toBe('true');
    fireEvent.click(screen.getByText('性别'));
    expect(
      screen.getByRole('switch', { name: '性别按选项限制名额' }).getAttribute('aria-checked'),
    ).toBe('false');
  });
});

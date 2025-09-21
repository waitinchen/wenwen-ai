import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status', { hidden: true })
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'Loading data...'
    render(<LoadingSpinner text={customText} />)
    
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('status', { hidden: true })
    expect(spinner.querySelector('div')).toHaveClass('w-4', 'h-4')

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('status', { hidden: true })
    expect(spinner.querySelector('div')).toHaveClass('w-12', 'h-12')
  })

  it('applies custom className', () => {
    const customClass = 'custom-class'
    render(<LoadingSpinner className={customClass} />)
    
    const spinner = screen.getByRole('status', { hidden: true })
    expect(spinner).toHaveClass(customClass)
  })
})


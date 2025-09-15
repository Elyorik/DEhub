import s from './container.module.scss';
import {type ReactNode } from 'react';
function Container({children}: {children: ReactNode}) {
  return (
    <div className={s.container}>
      {children}
    </div>
  )
}

export default Container

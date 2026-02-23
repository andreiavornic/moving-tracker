import { MOVEMENT_SPEED } from 'libs/common/constants';

/**
 * Determinam daca utilizatorul se misca in baza vitezei
 * @param speed
 * @returns true daca se misca, false daca sta pe loc
 */
export const isMoving = (speed: number): boolean => {
  return Math.abs(speed) > MOVEMENT_SPEED;
};

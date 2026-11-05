import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

type MotionTypewriter = {
    text: string;
    speed?: number;
}

export default function MotionTypewriter({ text, speed = 0.06 }: MotionTypewriter) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const displayText = useTransform(rounded, (latest) => text.slice(0, latest));

    useEffect(() => {
        const controls = animate(count, text.length, {
        type: 'tween',
        duration: text.length * speed,
        ease: 'linear',
        });

        return () => controls.stop();
    }, [text, speed, count]);

    return (
        <h1 className="text-4xl text-ink font-bold tracking-tight inline-flex flex-wrap justify-center items-center text-center">
        <motion.span>{displayText}</motion.span>
        
        {/* Blipping Cursor */}
        <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{
            repeat: Infinity,
            duration: 0.6,
            repeatType: 'reverse',
            ease: 'easeInOut',
            }}
            className="ml-1 inline-block w-[3px] h-8 bg-ink rounded-full"
        />
        </h1>
    );
}
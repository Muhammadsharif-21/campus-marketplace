import { useEffect, useState } from 'react';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const healthUrl = rawUrl.replace(/\/+$/, '').replace(/\/api$/, '') + '/health';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ServerStatus() {
  const [waking, setWaking] = useState(false);
  const [wakeTick, setWakeTick] = useState(0);

  useEffect(() => {
    let stopped = false;

    const wakeUp = async () => {
      for (let attempt = 0; attempt < 20 && !stopped; attempt++) {
        try {
          const res = await fetch(healthUrl, {
            cache: 'no-store',
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) {
            if (!stopped) setWaking(false);
            return;
          }
        } catch (err) {
          // the server isn't answering yet
        }

        if (stopped) return;
        setWaking(true);
        if (attempt % 3 === 0) setWakeTick((n) => n + 1);
        await sleep(4000);
      }
    };

    wakeUp();
    return () => {
      stopped = true;
    };
  }, []);

  if (!waking) return null;

  return (
    <div className="server-banner">
      {' '}
      <a href={healthUrl} target="_blank" rel="noopener noreferrer">
        Tap here if it takes too long
      </a>
      <iframe
        key={wakeTick}
        src={`${healthUrl}?wake=${wakeTick}`}
        title="wake"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default ServerStatus;